import { useState } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle2, ChevronDown, Clipboard, Database, ExternalLink, KeyRound, Link2, ShieldCheck, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './GuiaCrearUsuario.module.css';

const ROLES = [
  ['Administrador', 'Puede administrar todo el sistema.'],
  ['Creador de Ficha', 'Crea y edita fichas técnicas.'],
  ['Diseñador Creativo', 'Trabaja en el espacio creativo.'],
  ['Diseñador Técnico', 'Rol disponible para asignación técnica.'],
  ['Líder de Modistas', 'Consulta y coordina el taller.'],
  ['Trazador', 'Gestiona trazos y consumos.'],
  ['Especificadora', 'Completa la ficha final.'],
  ['Cortador', 'Trabaja con corte e informes de corte.'],
  ['Líder de Cortadores', 'Coordina corte e informes de corte.'],
  ['Bodega', 'Rol operativo de bodega.'],
  ['Visitante', 'Acceso básico de consulta.'],
];

const ACCOUNT_QUERY = `SELECT
    id,
    person_id,
    email,
    display_name,
    role,
    active,
    auth_user_id
FROM jo.user_accounts
WHERE lower(email) = lower('CORREO_DEL_USUARIO');`;

const ACCOUNT_UPDATE = `UPDATE jo.user_accounts
SET auth_user_id = 'UUID_COPIADO_DESDE_AUTH',
    person_id = ID_DE_PERSON,
    display_name = 'NOMBRE PARA MOSTRAR',
    role = 'Cortador',
    active = true
WHERE lower(email) = lower('CORREO_DEL_USUARIO');`;

const ACCOUNT_INSERT = `INSERT INTO jo.user_accounts
    (person_id, email, display_name, role, active, auth_user_id)
VALUES
    (ID_DE_PERSON,
     'CORREO_DEL_USUARIO',
     'NOMBRE PARA MOSTRAR',
     'Cortador',
     true,
     'UUID_COPIADO_DESDE_AUTH');`;

const PERSON_LINK = `UPDATE jo.persons
SET auth_user_id = 'UUID_COPIADO_DESDE_AUTH'
WHERE id = ID_DE_PERSON
  AND auth_user_id IS NULL;`;

const VERIFY_USER = `SELECT
    account.email,
    account.display_name,
    account.role,
    account.active,
    account.auth_user_id AS account_auth_user_id,
    person.id AS person_id,
    person.auth_user_id AS person_auth_user_id
FROM jo.user_accounts AS account
LEFT JOIN jo.persons AS person ON person.id = account.person_id
WHERE lower(account.email) = lower('CORREO_DEL_USUARIO');`;

const POWERSHELL_TEST = `$env:RUN_SUPABASE_INTEGRATION = "true"
$env:SUPABASE_TEST_URL = "https://TU-PROYECTO.supabase.co"
$env:SUPABASE_TEST_ANON_KEY = "TU-ANON-KEY"
$env:SUPABASE_TEST_USER_EMAIL = "usuario-prueba@dominio.com"
$env:SUPABASE_TEST_USER_PASSWORD = "CONTRASENA_DEL_USUARIO"
$env:SUPABASE_TEST_ADMIN_EMAIL = "admin-prueba@dominio.com"
$env:SUPABASE_TEST_ADMIN_PASSWORD = "CONTRASENA_DEL_ADMIN"

pnpm test:run tests/supabase-integration.test.js`;

const RLS_TABLES_QUERY = `SELECT
    c.relname AS table_name,
    c.relrowsecurity AS rls_enabled,
    COUNT(p.policyname) AS policy_count
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
LEFT JOIN pg_policies AS p
    ON p.schemaname = n.nspname
   AND p.tablename = c.relname
WHERE n.nspname = 'jo'
  AND c.relkind = 'r'
GROUP BY c.relname, c.relrowsecurity
ORDER BY c.relname;`;

const RLS_POLICIES_QUERY = `SELECT
    tablename,
    policyname,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'jo'
  AND tablename = 'NOMBRE_DE_LA_TABLA'
ORDER BY policyname;`;

const RLS_ENABLE_QUERY = `ALTER TABLE jo.NOMBRE_DE_LA_TABLA
ENABLE ROW LEVEL SECURITY;`;

const RLS_ACTIVE_READ_QUERY = `CREATE POLICY guide_active_select
ON jo.NOMBRE_DE_LA_TABLA
FOR SELECT
TO authenticated
USING ((SELECT jo.current_user_is_active()));`;

const RLS_ADMIN_QUERY = `CREATE POLICY guide_admin_all
ON jo.NOMBRE_DE_LA_TABLA
FOR ALL
TO authenticated
USING ((SELECT jo.current_user_has_role('Administrador')))
WITH CHECK ((SELECT jo.current_user_has_role('Administrador')));`;

const RLS_LOCKDOWN_QUERY = `ALTER TABLE jo.NOMBRE_DE_LA_TABLA
ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE jo.NOMBRE_DE_LA_TABLA
FROM anon, authenticated;

-- Sin politicas, la API no puede leer ni escribir esta tabla.`;

const RLS_VERIFY_QUERY = `SELECT
    c.relname AS table_name,
    c.relrowsecurity AS rls_enabled,
    COUNT(p.policyname) AS policy_count
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
LEFT JOIN pg_policies AS p
    ON p.schemaname = n.nspname
   AND p.tablename = c.relname
WHERE n.nspname = 'jo'
  AND c.relname = 'NOMBRE_DE_LA_TABLA'
GROUP BY c.relname, c.relrowsecurity;`;

function SqlCard({ title, description, code }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={styles.sqlCard}>
      <div className={styles.sqlHeader}>
        <div>
          <h4>{title}</h4>
          <p>{description}</p>
        </div>
        <button type="button" className={styles.copyButton} onClick={copyCode}>
          <Clipboard size={15} aria-hidden="true" />
          {copied ? 'Copiado' : 'Copiar SQL'}
        </button>
      </div>
      <pre className={styles.code}><code>{code}</code></pre>
    </div>
  );
}

function GuideStep({ number, icon: Icon, title, children, last = false }) {
  return (
    <section className={`${styles.step} ${last ? styles.lastStep : ''}`}>
      <div className={styles.stepMarker} aria-hidden="true">
        <span>{number}</span>
      </div>
      <div className={styles.stepBody}>
        <div className={styles.stepTitle}>
          <Icon size={21} aria-hidden="true" />
          <h2>{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function GuideAccordion({ id, icon: Icon, title, description, children }) {
  const [open, setOpen] = useState(false);
  const buttonId = `${id}-heading`;
  const panelId = `${id}-panel`;

  return (
    <section className={styles.accordion}>
      <h2 className={styles.accordionHeading}>
        <button
          id={buttonId}
          type="button"
          className={styles.accordionToggle}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(value => !value)}
        >
          <span className={styles.accordionIcon} aria-hidden="true"><Icon size={22} /></span>
          <span className={styles.accordionText}>
            <strong>{title}</strong>
            <small>{description}</small>
          </span>
          <ChevronDown className={`${styles.accordionChevron} ${open ? styles.accordionChevronOpen : ''}`} size={21} aria-hidden="true" />
        </button>
      </h2>
      {open && (
        <div id={panelId} className={styles.accordionPanel} role="region" aria-labelledby={buttonId}>
          {children}
        </div>
      )}
    </section>
  );
}

export default function GuiaCrearUsuario() {
  return (
    <div className={`fade-in ${styles.page}`}>
      <nav className="breadcrumb" aria-label="Ruta de navegación">
        <Link to="/configuracion" className="breadcrumb-link">Configuración</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">Guía para crear usuarios</span>
      </nav>

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">
          <UserPlus size={29} />
        </div>
        <div>
          <span className={styles.eyebrow}>Guía para administradores</span>
          <h1>Guías de administración</h1>
          <p>
            Selecciona una guía para realizar tareas de seguridad y administración en AtelierData.
            Los paneles están cerrados al entrar para que puedas elegir solo lo que necesitas.
          </p>
          <div className={styles.metaRow}>
            <span><ShieldCheck size={15} aria-hidden="true" /> Solo administradores</span>
            <span><CheckCircle2 size={15} aria-hidden="true" /> Paneles cerrados por defecto</span>
          </div>
        </div>
      </header>

      <section className={`${styles.callout} ${styles.calloutInfo}`} aria-labelledby="regla-principal">
        <ShieldCheck size={22} aria-hidden="true" />
        <div>
          <h2 id="regla-principal">La regla más importante</h2>
          <p>
            Nunca escribas contraseñas, claves <code>service_role</code> ni datos sensibles en SQL, en este instructivo,
            en el código de la aplicación o en GitHub. Las guías solo usan marcadores de ejemplo.
          </p>
        </div>
      </section>

      <div className={styles.accordionList}>
        <GuideAccordion
          id="crear-usuario"
          icon={UserPlus}
          title="Crear un nuevo usuario"
          description="Crear la persona, el acceso Auth y asignar sus permisos."
        >
          <section className={styles.quickStart} aria-labelledby="resumen-proceso">
            <div className={styles.sectionHeading}>
              <span className={styles.sectionKicker}>Resumen</span>
              <h2 id="resumen-proceso">El proceso completo en 5 pasos</h2>
            </div>
            <ol className={styles.overview}>
              <li><span>1</span><strong>Persona</strong><small>Crear o revisar sus datos en Configuración.</small></li>
              <li><span>2</span><strong>Auth</strong><small>Crear su correo y contraseña en Supabase.</small></li>
              <li><span>3</span><strong>Enlace</strong><small>Copiar el UUID y asociarlo con SQL.</small></li>
              <li><span>4</span><strong>Verificación</strong><small>Confirmar rol, enlace y estado activo.</small></li>
              <li><span>5</span><strong>Prueba</strong><small>Iniciar sesión y probar permisos.</small></li>
            </ol>
          </section>

          <GuideStep number="1" icon={UserPlus} title="Crea o revisa la persona en AtelierData">
        <p>
          Primero debe existir la persona en la aplicación. En el menú izquierdo entra a
          <strong> Configuración &gt; Personas</strong>.
        </p>
        <ol className={styles.instructions}>
          <li>Si la persona no existe, pulsa <strong>Nueva persona</strong>.</li>
          <li>Escribe nombre, apellido, correo y los demás datos disponibles.</li>
          <li>Guarda la persona y confirma que el correo esté escrito correctamente.</li>
          <li>Si ya existe, edítala y corrige el correo si es necesario.</li>
        </ol>
        <div className={styles.tip}>
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>Usa exactamente el mismo correo en AtelierData y en Supabase Auth.</span>
        </div>
          </GuideStep>

          <GuideStep number="2" icon={KeyRound} title="Crea el acceso en Supabase Auth">
        <p>Este paso crea el usuario que podrá iniciar sesión.</p>
        <ol className={styles.instructions}>
          <li>Abre el panel de tu proyecto en Supabase.</li>
          <li>Entra a <strong>Authentication &gt; Users</strong>.</li>
          <li>Pulsa <strong>Add user</strong> o <strong>Create user</strong>.</li>
          <li>Escribe el mismo correo de la persona y una contraseña temporal segura.</li>
          <li>Activa <strong>Auto Confirm User</strong> si aparece esa opción.</li>
          <li>Crea el usuario y copia su <strong>User UID</strong>. Lo necesitarás en el siguiente paso.</li>
        </ol>
        <div className={styles.warning}>
          <AlertTriangle size={18} aria-hidden="true" />
          <span>El User UID es un identificador, no es la contraseña. No publiques la contraseña ni la envíes por el chat.</span>
        </div>
        <a className={styles.externalLink} href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">
          Abrir Supabase Dashboard <ExternalLink size={15} aria-hidden="true" />
        </a>
          </GuideStep>

          <GuideStep number="3" icon={Link2} title="Enlaza Auth con la cuenta de AtelierData">
        <p>
          Ahora entra a <strong>SQL Editor</strong> en Supabase. Los bloques siguientes no crean contraseñas:
          solo guardan el UUID del usuario y su rol en las tablas de AtelierData.
        </p>
        <div className={styles.noticeSmall}>
          <strong>Antes de ejecutar:</strong> reemplaza los textos en MAYÚSCULAS por tus datos reales.
          No reemplaces las comillas ni ejecutes un bloque con los marcadores sin cambiar.
        </div>
        <SqlCard
          title="3.1 Buscar la cuenta"
          description="Ejecuta esto para saber si ya existe una fila en user_accounts."
          code={ACCOUNT_QUERY}
        />
        <SqlCard
          title="3.2 Caso habitual: la cuenta ya existe"
          description="Usa el correo para enlazar UUID, persona y rol. Cambia ID_DE_PERSON y 'Cortador' si corresponde."
          code={ACCOUNT_UPDATE}
        />
        <SqlCard
          title="3.3 Si la cuenta no existe"
          description="Usa este bloque solo si la búsqueda anterior no devolvió filas. ID_DE_PERSON es el ID del paso 1."
          code={ACCOUNT_INSERT}
        />
        <div className={styles.tip}>
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>No vuelvas a ejecutar las migraciones 022 o 023 para cada usuario. Esas migraciones se ejecutan una sola vez.</span>
        </div>
          </GuideStep>

          <GuideStep number="4" icon={ShieldCheck} title="Completa el enlace y verifica los datos">
        <p>
          Normalmente la relación con la persona queda completa cuando `person_id` está definido. Si la columna
          de la persona sigue vacía, ejecuta el siguiente bloque con el ID correcto.
        </p>
        <SqlCard
          title="4.1 Enlazar también la persona"
          description="Ejecútalo solo si person_auth_user_id aparece vacío en la verificación."
          code={PERSON_LINK}
        />
        <SqlCard
          title="4.2 Verificar el resultado"
          description="Debe mostrar el mismo UUID en account_auth_user_id y person_auth_user_id."
          code={VERIFY_USER}
        />
        <div className={styles.checklist}>
          <h3>El resultado correcto debe cumplir todo esto:</h3>
          <ul>
            <li>El correo es el esperado.</li>
            <li><code>role</code> contiene uno de los roles válidos.</li>
            <li><code>active</code> es <code>true</code>.</li>
            <li><code>account_auth_user_id</code> contiene el User UID de Auth.</li>
            <li>La persona y la cuenta tienen el mismo UUID cuando ambas están enlazadas.</li>
          </ul>
        </div>
          </GuideStep>

          <GuideStep number="5" icon={CheckCircle2} title="Prueba el inicio de sesión y los permisos" last>
        <p>
          Cierra tu sesión actual y entra con el correo y la contraseña del usuario nuevo. Comprueba que vea solo
          las opciones correspondientes a su rol.
        </p>
        <div className={styles.roleTableWrap}>
          <table className={styles.roleTable}>
            <caption>Roles que se pueden escribir en jo.user_accounts.role</caption>
            <thead>
              <tr><th>Rol exacto</th><th>Uso general</th></tr>
            </thead>
            <tbody>
              {ROLES.map(([role, description]) => (
                <tr key={role}><td><code>{role}</code></td><td>{description}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.testBox}>
          <div className={styles.testBoxHeading}>
            <Clipboard size={20} aria-hidden="true" />
            <h3>Para ejecutar las pruebas Auth/RLS</h3>
          </div>
          <p>
            Necesitas dos cuentas de prueba distintas: una cuenta normal con cualquier rol excepto Administrador
            y una cuenta con el rol <strong>Administrador</strong>. Las dos deben estar activas y enlazadas.
          </p>
          <div className={styles.credentialsHelp}>
            <h3>¿Dónde encuentro la URL y la anon key?</h3>
            <p>Ambos valores están en el mismo lugar del panel de Supabase:</p>
            <ol>
              <li>Inicia sesión en <strong>supabase.com</strong> y entra a tu proyecto.</li>
              <li>En el menú izquierdo, abre <strong>Settings</strong> o <strong>Configuración</strong> (icono de engranaje).</li>
              <li>Selecciona <strong>API</strong>.</li>
              <li>Para <code>SUPABASE_TEST_URL</code>, copia el valor de <strong>Project URL</strong> que aparece en la parte superior. Tiene un formato parecido a <code>https://tu-identificador.supabase.co</code>.</li>
              <li>Para <code>SUPABASE_TEST_ANON_KEY</code>, baja hasta <strong>Project API keys</strong> y copia la clave etiquetada <strong>anon</strong> y <strong>public</strong>.</li>
            </ol>
            <div className={styles.warning}>
              <AlertTriangle size={18} aria-hidden="true" />
              <span>Usa únicamente <strong>anon public</strong>. Nunca copies ni uses la clave <code>service_role</code> en la aplicación, en esta guía o en las pruebas del navegador.</span>
            </div>
          </div>
          <p className={styles.inlineNote}>
            Estos comandos se ejecutan en una terminal <strong>PowerShell</strong>, desde la carpeta raíz del proyecto.
            Pégalos en la misma ventana y cambia los valores de ejemplo.
          </p>
          <pre className={styles.code}><code>{POWERSHELL_TEST}</code></pre>
          <div className={styles.warning}>
            <AlertTriangle size={18} aria-hidden="true" />
            <span>Los textos como <code>TU-ANON-KEY</code> y <code>CONTRASENA_DEL_USUARIO</code> son marcadores. No los ejecutes literalmente.</span>
          </div>
          </div>
          </GuideStep>

          <section className={styles.troubleshooting} aria-labelledby="problemas-comunes">
        <div className={styles.sectionHeading}>
          <span className={styles.sectionKicker}>Ayuda rápida</span>
          <h2 id="problemas-comunes">Si algo no funciona</h2>
        </div>
        <div className={styles.problemGrid}>
          <article>
            <h3>“No se pudo validar tu cuenta”</h3>
            <p>Revisa que el UUID esté en <code>jo.user_accounts.auth_user_id</code>, que el rol esté escrito exactamente y que <code>active</code> sea <code>true</code>.</p>
          </article>
          <article>
            <h3>La prueba aparece como omitida</h3>
            <p>Confirma que las siete variables de PowerShell estén definidas en la misma terminal y que hayas escrito <code>true</code> en <code>RUN_SUPABASE_INTEGRATION</code>.</p>
          </article>
          <article>
            <h3>“Duplicate key” al enlazar</h3>
            <p>Ese UUID ya está enlazado a otra cuenta o persona. Detén el proceso y revisa los resultados antes de cambiar datos.</p>
          </article>
          <article>
            <h3>Desactivar un usuario</h3>
            <p>Cambia <code>jo.user_accounts.active</code> a <code>false</code>. Esto bloquea el acceso a AtelierData sin borrar el usuario de Auth.</p>
          </article>
        </div>
          </section>
        </GuideAccordion>

        <GuideAccordion
          id="activar-rls"
          icon={Database}
          title="Activar RLS en una tabla"
          description="Proteger tablas nuevas o antiguas sin dejar accesos abiertos."
        >
          <div className={styles.rlsIntro}>
            <p>
              RLS significa <strong>Row Level Security</strong>. Es la protección que decide qué puede leer o modificar
              cada usuario desde la aplicación. Activarlo no es suficiente: después debes crear las políticas correctas.
            </p>
            <div className={styles.warning}>
              <AlertTriangle size={18} aria-hidden="true" />
              <span>Si activas RLS y no creas políticas, la API bloqueará el acceso. Eso es correcto para una tabla de respaldo, pero puede dejar una pantalla vacía si la tabla sí se usa.</span>
            </div>
          </div>

          <div className={styles.rlsInstructions}>
            <h3>Antes de comenzar</h3>
            <ol className={styles.instructions}>
              <li>Abre el proyecto correcto en Supabase.</li>
              <li>Entra a <strong>SQL Editor</strong> y pulsa <strong>New query</strong>.</li>
              <li>No ejecutes comandos de otra tabla. Cambia siempre <code>NOMBRE_DE_LA_TABLA</code> por el nombre real.</li>
              <li>Si la tabla ya tiene políticas, revísalas antes de crear nuevas. No las borres a ciegas.</li>
            </ol>
          </div>

          <SqlCard
            title="1. Buscar tablas sin RLS"
            description="Ejecuta esta consulta para identificar tablas que todavía no están protegidas."
            code={RLS_TABLES_QUERY}
          />
          <SqlCard
            title="2. Revisar las políticas actuales"
            description="Reemplaza NOMBRE_DE_LA_TABLA y ejecuta antes de modificar una tabla existente."
            code={RLS_POLICIES_QUERY}
          />
          <SqlCard
            title="3. Activar RLS"
            description="Este paso activa la protección, pero todavía debes elegir las políticas."
            code={RLS_ENABLE_QUERY}
          />
          <div className={styles.rlsChoiceGrid}>
            <article>
              <h3>Tabla que pueden leer usuarios activos</h3>
              <p>Usa esta política solo si la información debe estar disponible para las cuentas activas.</p>
              <pre className={styles.code}><code>{RLS_ACTIVE_READ_QUERY}</code></pre>
            </article>
            <article>
              <h3>Tabla que solo administra el administrador</h3>
              <p>Esta política permite CRUD únicamente al rol Administrador.</p>
              <pre className={styles.code}><code>{RLS_ADMIN_QUERY}</code></pre>
            </article>
          </div>
          <SqlCard
            title="4. Bloquear una tabla de respaldo o sin uso"
            description="Para tablas antiguas, respaldos o tablas que no usa la aplicación actual. No crea políticas de lectura."
            code={RLS_LOCKDOWN_QUERY}
          />
          <SqlCard
            title="5. Verificar una tabla"
            description="Debe devolver rls_enabled = true. Sustituye el nombre antes de ejecutar."
            code={RLS_VERIFY_QUERY}
          />
          <div className={styles.checklist}>
            <h3>Reglas para no abrir una brecha de seguridad</h3>
            <ul>
              <li>Usa <code>TO authenticated</code>, no <code>TO public</code> ni <code>TO anon</code>.</li>
              <li>No pongas la clave <code>service_role</code> en React ni en el navegador.</li>
              <li>No copies una política de lectura para una tabla que contiene respaldos o datos privados.</li>
              <li>Registra el cambio en una migración SQL para que el siguiente despliegue sea reproducible.</li>
              <li>Después de cambiar RLS, prueba la pantalla con un usuario normal y con un administrador.</li>
            </ul>
          </div>
        </GuideAccordion>

        <GuideAccordion
          id="pruebas-auth-rls"
          icon={Clipboard}
          title="Entender y ejecutar las pruebas Auth/RLS"
          description="Comprobar que los usuarios, roles y permisos funcionen de verdad."
        >
          <div className={styles.testGuideIntro}>
            <p>
              Estas pruebas se conectan al proyecto real de Supabase. No prueban únicamente la pantalla de inicio de sesión:
              prueban que la base de datos también bloquee los accesos incorrectos.
            </p>
            <div className={styles.tip}>
              <ShieldCheck size={18} aria-hidden="true" />
              <span>Piensa en la aplicación como la puerta principal y en RLS como la cerradura de cada oficina. Las dos protecciones deben funcionar.</span>
            </div>
          </div>

          <div className={styles.testSteps}>
            <h3>Cómo ejecutar la prueba</h3>
            <ol className={styles.instructions}>
              <li>Ten dos cuentas activas y enlazadas: una cuenta normal y una cuenta con rol <code>Administrador</code>.</li>
              <li>Abre una terminal <strong>PowerShell</strong> desde la carpeta raíz del proyecto.</li>
              <li>Define las siete variables del bloque siguiente en esa misma terminal.</li>
              <li>Reemplaza todos los textos de ejemplo por tus datos reales. No uses los marcadores literalmente.</li>
              <li>Ejecuta el comando final y espera el resultado.</li>
            </ol>
            <pre className={styles.code}><code>{POWERSHELL_TEST}</code></pre>
          </div>

          <div className={styles.testPurposeGrid}>
            <article>
              <span className={styles.testPurposeNumber}>1</span>
              <h3>Usuario normal</h3>
              <p>Confirma que solo vea su propia cuenta y que no pueda hacerse pasar por administrador.</p>
            </article>
            <article>
              <span className={styles.testPurposeNumber}>2</span>
              <h3>Administrador y anónimo</h3>
              <p>Confirma que el administrador sea reconocido y que una persona sin sesión no pueda consultar ni ejecutar operaciones protegidas.</p>
            </article>
            <article>
              <span className={styles.testPurposeNumber}>3</span>
              <h3>Escritura restringida</h3>
              <p>Confirma que un usuario normal no pueda insertar códigos en <code>code_pool</code>, una operación reservada al administrador.</p>
            </article>
          </div>

          <div className={styles.expectedResult}>
            <h3>Resultado correcto</h3>
            <p>Debes ver un resultado parecido a este:</p>
            <pre className={styles.code}><code>{`Test Files  1 passed (1)
Tests       3 passed (3)`}</code></pre>
            <p>
              Esto significa que Auth identificó a los usuarios, los roles fueron reconocidos y RLS rechazó los accesos indebidos.
            </p>
          </div>

          <div className={styles.checklist}>
            <h3>Qué demuestra y qué no demuestra</h3>
            <ul>
              <li><strong>Sí demuestra:</strong> que las reglas principales de Auth, roles, RPC y RLS están funcionando en Supabase.</li>
              <li><strong>No demuestra:</strong> que cada pantalla y cada rol de la aplicación hayan sido probados.</li>
              <li><strong>Tampoco prueba:</strong> la Edge Function de Google Sheets, que permanece como tarea pospuesta.</li>
              <li>Después de modificar políticas RLS, repite estas pruebas antes de continuar.</li>
            </ul>
          </div>
        </GuideAccordion>
      </div>

      <footer className={styles.footerNote}>
        <ShieldCheck size={18} aria-hidden="true" />
        <span>Esta guía no contiene claves, contraseñas ni datos propios del proyecto. No guardes información sensible en el código fuente.</span>
        <Link to="/configuracion" className="btn btn-secondary btn-sm"><ArrowLeft size={15} aria-hidden="true" /> Volver a Configuración</Link>
      </footer>
    </div>
  );
}
