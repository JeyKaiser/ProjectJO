import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

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
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { spreadsheetId, sheetName } = await req.json();
    if (!spreadsheetId || !sheetName) {
      return new Response(JSON.stringify({ error: "spreadsheetId y sheetName requeridos" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const saRaw = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    if (!saRaw) {
      return new Response(JSON.stringify({ error: "GOOGLE_SERVICE_ACCOUNT_JSON no configurado" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
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
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
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
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
