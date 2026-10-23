# L3-v7 — runbook de revisión del piloto SS27 (NO ejecutado)

**NO hay piloto aprovisionado ni migraciones ejecutadas.** Este documento no
autoriza acciones en la base real. No copiar/importar/promover datos del piloto
hacia la base real, no borrar referencias y no ejecutar `029`.

## Gate humano previo

1. El propietario aprovisiona **externamente** un proyecto Supabase aislado
   para SS27, sin compartir configuración con el origen. Este repositorio no
   crea ni copia el proyecto ni consulta sus datos o credenciales. Un revisor
   distinto comprueba la identidad del proyecto de destino por canales seguros.
2. El revisor verifica que `022`, `023`, `024`, `025`, `026`, `027` y `028` estén
   efectivamente aplicadas **en el clon**, que `029` **NO** esté aplicada y que
   SS27 exista con `collections.code='SS27'`, `year=2027`, `references.year=2027`.
   `jo.tipo_prendas.id` debe ser `integer` con DEFAULT/IDENTITY y la tabla
   catálogo estar vacía; si falta generador de ID, `030` aborta sin cambiar
   esquema y requiere revisión, no inventar IDs en producción.
   Comparar por separado conteo e IDs de las 11 históricas informadas antes y
   después. No autoconvertir ni corregir históricos con SQL de este cambio.
   Antes del índice único SS27, el preflight 031 detecta identidades duplicadas
   (`collection_id`, `year`, `reference_number`), muestra claves/IDs y aborta:
   no deduplica ni cambia fichas existentes. Un hallazgo exige revisión manual.
3. Revisar permisos efectivos/RLS, propiedad de funciones SECURITY DEFINER,
   trigger order y SQL completo de `030`, `031` y `032` antes de su aplicación.
   Las pruebas estáticas de JS **no** validan SQL ni aislamiento transaccional.
4. Solo en sesión confirmada del clon (jamás en origen), y después de revisión
   independiente, el operador puede establecer
   `SET jo.pilot_ss27_isolated = 'approved'` en esa sesión y aplicar en orden
   `migracion/030_ss27_catalog_additive.sql` →
   `migracion/031_ss27_workflow.sql` →
   `migracion/032_ss27_create_receipt.sql`. No habilitar la aplicación entre
   estos scripts: 032 exige cero recibos preexistentes y cambia la RPC pública
    a `pilot_create_reference_032`. Si hay recibos existentes, detenerse para
    revisión manual, no inferir resultados originales de fichas editables.
    El core 031 queda sin EXECUTE para PUBLIC/anon/authenticated ya al terminar
    031; solo su propietario lo usa internamente desde 032. Comprobar su ACL
    antes y después: no basta con mantener la UI apagada durante el intervalo.
    Si 032 aborta por un recibo previo sin resultado, revisar manualmente cada
    recibo, ficha e historial en el clon; detenerse, sin rellenar ni modificar
    ese recibo por inferencia. Resolver mediante decisión humana aprobada antes
    de reintentar 032.
   El SET es una confirmación manual, NO
   demuestra identidad del servidor ni sustituye la verificación del paso 1.
5. Usar un despliegue frontend distinto, habilitando solo allí
   `VITE_PILOT_COLLECTION_CODE=SS27`. Sin esa variable, la creación desde
   `/ficha-nueva` está deshabilitada (no existe ruta de alta parcial no piloto
   en este cambio). La variable no es una frontera de seguridad: el proyecto
   Supabase aislado se valida externamente y la RPC comprueba SS27 y RBAC.
   Aunque el clon contenga referencias antiguas de otras colecciones, las
   altas fuera de SS27 están deshabilitadas en el piloto (`030` guarda solo
   INSERT); los UPDATE de campos no-status conservan sus permisos legacy y el
   Admin puede editar `status_id` en todas las colecciones.
6. En el clon solamente, ejecutar manualmente el script READ ONLY
   `migracion/verify_030_031_ss27.sql` y pruebas con JWT Admin/Creador activo,
   otro rol, usuario inactivo, otra colección, inserción maliciosa de status,
    edición permitida sin status, create con CANCELADO y snapshot vacío,
    create rollback cuando falla montaje/referente, fork cancelado/terminado desde
    tronco avanzado, bloqueo cierre Comercial, merge automático,
   doble request_id, expected_version obsoleta, cancel/reactivar dos episodios,
   cancelación histórica sin snapshot, direct writes y hand-offs.
   **Hasta entonces: NOT_VALIDATED**. Falla de cualquier gate: no publicar.
   El verificador estático/READ-ONLY no certifica esos resultados: los gates
   manuales JWT/RLS/rollback/concurrencia siguen **NOT_VALIDATED** hasta que
    un revisor los realice y documente expresamente en el clon aislado.
   Gates concretos para los triggers 028/031, siempre en el clon aislado:
   cancelar al crear (INIT concepto + CANCELADO atómicos) y reactivar; cancelar
   y reactivar con 0 forks; cancelar y reactivar con varios forks activos de
   progreso/responsable distintos (comparar snapshot exacto e historial);
   históricas sin snapshot fiable deben bloquear cancelación/reactivación y
   exigir revisión manual, nunca inventar concepto. Verificar que el trigger
   028 no reescribe el tronco ni restaura forks resueltos por 031. Resultado
   JWT/RLS/SQL **NOT_VALIDATED** hasta ejecución manual aprobada.

**F01/F03 preparados en código:** la fachada `pilot_create_reference_032`
retorna el snapshot JSON original del recibo en los reintentos; delega la
primera alta al core privado `pilot_create_reference_031`, que incluye ficha,
montaje, referente, INIT e historial en una transacción. Alta cancelada crea
episodio vacío y restaura `concepto` al reactivar; el constraint trigger
diferido rechaza alta SS27 sin workflow. Ninguna de estas propiedades está
**validada en BD**; verificar con JWT y fallos provocados de FK en el clon.
`pilot_version` es NULL en referencias previas: nunca marca como piloto a
históricos automáticamente. La revisión manual de históricos no se sustituye
por `INIT` ni por restauración inferida.
Inbox piloto: leer `reference_states` con colección SS27 y año de referencia
2027 filtrados en servidor; paginar por ID y cargar detalles por lotes. Medir
volumen y RLS con JWT en el clon: **NOT_VALIDATED**.

**Códigos poscommit:** MD/PT se asignan individualmente con RPC 028 sobre
códigos existentes DISPONIBLE. Fallo de uno no revierte ficha ni otro código;
UI presenta pendiente/error y reintenta solo el faltante. Nunca presentar un
 código derivado como si estuviera asignado. La ficha no crea códigos de pool.

**Separación de autoridad:** el guard de `status_id` exige Administrador en
referencias de **todas** las colecciones; no restringe la actualización de
otros campos por roles autorizados. La autoridad temporal de Administrador
para *eventos de workflow* es exclusiva de SS27. La verificación real de
ambas reglas con JWT/RLS en el clon permanece **NOT_VALIDATED**.

**Identidad de lectura/reintento:** la navegación de ficha usa colección +
año + número y las consultas de detalle/consumos usan `references.id`; nunca
se selecciona un registro solo por número. Un rechazo SQL definitivo permite
corregir el formulario; una respuesta de red incierta conserva UUID/payload
hasta reintentar o hasta que el operador descarte expresamente el intento,
previa comprobación de existencia para evitar un alta duplicada.
La RPC serializa `request_id` mediante advisory lock transaccional antes de
consultar el recibo, con PK como respaldo. Concurrencia real sigue pendiente
de prueba manual en el clon.
Tras una respuesta incierta que sobreviva una recarga de página, no asumir
«no creada». Si se conservan UUID y payload originales, un operador autorizado
debe verificar en el recibo actor+UUID+hash del payload+reference_id, comparar
el payload JSONB guardado con el original y su resultado original antes de
continuar con ese mismo intento (ningún hash se almacena automáticamente; la
comparación/hash se realiza manualmente de forma canónica). La tabla de recibos
NO se expone al navegador. Si está sin UUID o sin recibo atribuible, consultar
la identidad exacta SS27/2027/reference_number y hacer reconciliación manual
de ficha, recibos e historial. Una ficha encontrada no prueba que pertenezca a
ese intento; no atribuirla ni asignar MD/PT por inferencia. Si no puede
atribuirse con certeza, detenerse y solicitar revisión Admin/operación antes
de cualquier nuevo UUID. Un timeout no demuestra ausencia de alta.

**F05:** la lectura de montaje usa una consulta por lote para todas las
referencias visibles, con lotes de IDs de hasta 200 y páginas de hasta 500
filas ordenadas por cursor `id`; no consulta por cada referencia. Referencias
del dashboard se filtran por colección (y por año SS27/2027) en servidor antes
de paginar; asignaciones MD/PT también usan cursor `id` hasta una página vacía,
incluso con límites de filas menores en PostgREST. La búsqueda de nombre,
número o código PT asignado consulta sus tablas de origen y filtra por
colección/año en servidor: no inventa códigos ni lee solo 250 fichas.
Medir latencia, volumen y completitud en el clon antes de reclamar
escalabilidad: hasta entonces rendimiento **NOT_VALIDATED**.

## Pendientes explícitos

- No ejecutar `029` (pausada) ni una migración para retirar `reference_type`:
  no existe en L3-v5 y requiere autorización posterior explícita.
- Clasificación manual individual de las 11 referencias históricas en el clon.
- Liderazgo de área, mapeo evento/estado/fork→área y asignación a fork: tarea
  futura; Admin en piloto es una autoridad temporal.
- Validación de credenciales: pendiente final; no realizarla en esta entrega.
- Auto-forks de procesos especiales e importación de datos: diferidos.
- Includes, asignaciones de equipo y boceto/archivo retirados temporalmente de
  `/ficha-nueva`: su modelo de persistencia requiere decisión futura.
