import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const ALLOWED_ROLES = new Set([
  "Administrador",
  "Cortador",
  "Líder de Cortadores",
]);

class RequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function allowedOrigins() {
  return new Set(
    (Deno.env.get("ALLOWED_ORIGINS") || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
}

function corsHeaders(req) {
  const origin = req.headers.get("Origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (origin && allowedOrigins().has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers.Vary = "Origin";
  }

  return headers;
}

function isAllowedOrigin(req) {
  const origin = req.headers.get("Origin");
  return !origin || allowedOrigins().has(origin);
}

async function authenticateRequest(req) {
  const authorization = req.headers.get("Authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new RequestError("Se requiere una sesión autenticada.", 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new RequestError("La función no tiene configurada la conexión de Supabase.", 500);
  }

  const token = match[1];
  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!userResponse.ok) throw new RequestError("La sesión de Supabase no es válida.", 401);

  const user = await userResponse.json();
  if (!user?.id) throw new RequestError("La sesión de Supabase no es válida.", 401);
  const accountResponse = await fetch(
    `${supabaseUrl}/rest/v1/user_accounts?select=role,active&auth_user_id=eq.${encodeURIComponent(user.id)}`,
    {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${token}`,
        "Accept-Profile": "jo",
      },
    },
  );
  if (!accountResponse.ok) throw new RequestError("No se pudo validar el rol de la cuenta.", 500);

  const accounts = await accountResponse.json();
  const account = accounts[0];
  if (!account?.active || !ALLOWED_ROLES.has(account.role)) {
    throw new RequestError("Tu rol no está autorizado para leer Google Sheets.", 403);
  }

  return user;
}

function base64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signJWT(header, payload, privateKeyPem) {
  const pemBody = privateKeyPem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  const binaryKey = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const headerB64 = base64url(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64url(new TextEncoder().encode(JSON.stringify(payload)));
  const toSign = `${headerB64}.${payloadB64}`;

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(toSign),
  );

  return `${toSign}.${base64url(signature)}`;
}

async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now,
  };

  const jwt = await signJWT(header, payload, sa.private_key);

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(`Token error: ${data.error} - ${data.error_description}`);
  return data.access_token;
}

Deno.serve(async (req) => {
  const headers = corsHeaders(req);

  if (!isAllowedOrigin(req)) {
    return new Response(JSON.stringify({ error: "Origen no autorizado" }), {
      status: 403,
      headers,
    });
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405,
      headers,
    });
  }

  try {
    await authenticateRequest(req);
    const { spreadsheetId, sheetName } = await req.json();
    if (!spreadsheetId || !sheetName) {
      return new Response(JSON.stringify({ error: "spreadsheetId y sheetName requeridos" }), {
        status: 400,
        headers,
      });
    }

    const saRaw = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    if (!saRaw) {
      return new Response(JSON.stringify({ error: "GOOGLE_SERVICE_ACCOUNT_JSON no configurado" }), {
        status: 500,
        headers,
      });
    }

    const sa = JSON.parse(saRaw);
    const token = await getAccessToken(sa);

    const range = encodeURIComponent(sheetName);
    const url = `${SHEETS_API}/${spreadsheetId}/values/${range}`;

    const sheetRes = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const sheetData = await sheetRes.json();
    const values = sheetData.values || [];
    if (values.length < 2) {
      return new Response(JSON.stringify({ rows: [] }), {
        headers,
      });
    }

    const headers = values[0].map(h => String(h).trim().toUpperCase());
    const dataRows = values.slice(1);

    const rows = dataRows.map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] !== undefined ? String(row[i]).trim() : '';
      });
      return obj;
    });

    return new Response(JSON.stringify({ rows }), {
      headers,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: e instanceof RequestError ? e.status : 500,
      headers,
    });
  }
});
