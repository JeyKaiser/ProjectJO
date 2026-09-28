# Tareas Pendientes — Matriz JO / AtelierData

## Fase 1: Auditoria

- [x] ~~[ALTA] RLS bloquea INSERT/UPDATE en navegador~~ — Corregido: politicas anon agregadas a 30 tablas
- [x] [ALTA] Agregar autenticacion Supabase Auth (login real) para reemplazar mock de roles — `migracion/022_auth_rbac.sql` ejecutada por el usuario
- [x] [ALTA] Implementar ProtectedRoute para validacion de roles en la interfaz — usa roles reales de Auth/RBAC
- [x] [ALTA] Envolver rutas protegidas en App.jsx con ProtectedRoute — proteccion de interfaz completada; no sustituye Auth/RBAC/RLS
- [x] [ALTA] Definir matriz de permisos: implementada por recurso en `migracion/023_rbac_policies.sql`
- [x] [ALTA] Implementar RBAC real en servidor usando identidad Auth y roles de base de datos — requiere ejecutar 023
- [x] [ALTA] Migrar las politicas RLS de anon a authenticated y aplicar permisos por usuario y rol — requiere ejecutar 023
- [x] [ALTA] Relacionar auth.users con user_accounts y persons mediante auth_user_id — migracion `022_auth_rbac.sql`
- [x] [ALTA] Exigir JWT y autorizacion por rol en la Edge Function de Google Sheets — implementado en `supabase/functions/google-sheets/index.ts`; requiere desplegar
- [x] [ALTA] Restringir CORS de la Edge Function a los origenes autorizados — requiere configurar `ALLOWED_ORIGINS`

> Nota: las tareas relacionadas con Google Sheets, CSV y Excel quedan pospuestas durante la etapa de desarrollo local. Se conservaran para la etapa de produccion.

### Google Sheets (pospuesto)

- [ ] [ALTA] Confirmar si la importacion directa desde Google Sheets se utilizara en produccion
- [ ] [ALTA] Desplegar la Edge Function `google-sheets` en el proyecto Supabase
- [ ] [ALTA] Configurar los secretos `ALLOWED_ORIGINS` y `GOOGLE_SERVICE_ACCOUNT_JSON`
- [ ] [MEDIA] Compartir el Spreadsheet con la cuenta de servicio usando permiso de lectura
- [ ] [MEDIA] Probar la importacion con un usuario autorizado y confirmar el rechazo de roles no autorizados

## Fase 2: Segmentacion / Datos

- [x] [ALTA] Migrar colecciones faltantes: FW26, SPRING SUMMER, SUMMER VACATION, PREFALL RTW
- [ ] [MEDIA] Subir consumos masivos desde archivo Excel simplificado (solo REF, ROL, TIPO, VERSION, VALOR)
- [ ] [MEDIA] Formulario individual de consumos en ReferenciaDetalle (agregar/editar/eliminar)
- [x] [MEDIA] Overlay gris en cards de referencias con estado "Cancelado" para indicarlo visualmente — requiere ejecutar `migracion/025_reference_statuses.sql` y `migracion/026_reference_statuses_seed.sql`
- [x] [ALTA] Filtros y busqueda en vista de referencias por año: filtrar por estado y clasificacion; buscar por numero, codigo MD/PT o nombre
- [ ] [ALTA] Subir lista real de telas (codigo, descripcion, ancho y foto) desde archivo o formulario masivo
- [ ] [ALTA] En futuras importaciones, no interpretar la fecha/timestamp de carga como fecha historica real de la referencia o de sus procesos; conservar ambas semanticas en campos separados
- [ ] [ALTA] Antes de habilitar la importacion SS27, administrar en el catalogo una `collections.code = 'SS27'`, `season = 'SS'`, `collections.year = 2027` y su `collection_years.year = 2027` visible. La migracion 028 solo verifica esta precondicion y no crea la coleccion.
- [ ] [ALTA] Coordinar frontend y una migracion posterior antes de cambiar la autoridad de codigos: en 028 `code_pool`/`reference_codes` siguen escribibles y son la unica autoridad; `md_codes`/`pt_codes` y sus asignaciones son proyecciones separadas de solo lectura.
- [x] [ALTA] El importador contractual usa exclusivamente las RPC de 029 (`preview_csv_reference_import` y una única `confirm_csv_reference_import` idempotente por usuario/`confirmation_id`). 029 es la autoridad del contrato CSV v0.1: no encadena escrituras por fila desde el cliente, no importa telas ni estados por área y no crea códigos faltantes. Las RPC 028 se conservan temporalmente solo para compatibilidad de integraciones anteriores y no deben usarse para el importador contractual.
- [ ] [ALTA] Tratar `rollback_028_reference_import_integrity.sql` como retirada operativa, no como rollback completo: primero exige paridad bidireccional completa (identidad, pool, titular, `active`, `status` y conteos), aborta ante importaciones/asignaciones no reconciliadas y, al retirar los triggers, marca las proyecciones obsoletas y revoca escritura cliente tanto nueva como legacy. Nunca reactiva una autoridad a ciegas.
- [ ] [ALTA] Gate obligatorio de staging para 028: ejecutar `migracion/verify_028_reference_import_integrity.sql` mediante la API con JWT de un Administrador activo y exigir `EFFECTIVE_RLS_AUTHENTICATED = PASS` y `FUNCTIONAL_RPC_ADMIN_JWT = PASS`. Cualquier `NOT_VALIDATED` por `current_user <> 'authenticated'` (SQL Editor/sin JWT) no aprueba staging; las asignaciones MD/PT runtime pueden quedar `NOT_VALIDATED` sin códigos `DISPONIBLE`, pero `MD_PT_STATIC` debe quedar `PASS`.
- [ ] [ALTA] La reejecucion de 028 soporta upgrade desde la variante previa con guards `trg_028_freeze_*`: dentro de la misma transaccion retira solo esos guards y restaura los grants legacy minimos antes del backfill. `register_reference_import` es auxiliar interna sin `EXECUTE` para cliente; la integracion por fila usa exclusivamente `commit_reference_import_row`.
- [ ] [MEDIA] Las RPC 028 normalizan locks como lote → referencia → `code_pool` → `reference_codes` y el guard diferido valida solo claves afectadas. Los triggers heredados de 013 o integraciones SQL externas no garantizan ese orden: deben mantener transacciones cortas y reintentar `40P01`; no presentar esta limitacion como escalabilidad irrestricta.
- [ ] [ALTA] Diseñar e implementar posteriormente el modelo de proceso general y sus transiciones automáticas, derivadas de los estados ingresados por los usuarios de cada área; no debe depender de una columna del CSV. Debe contemplar desarrollo textil (antes concepto), desarrollo coleccion y comunicaciones (antes diseño), first buy, market y final buy (antes costeo), industrialización, producción, comercial y cancelado. Comunicaciones y market deben existir conceptualmente aunque inicialmente no tengan UI/lógica completa.
- [ ] [ALTA] Deuda temporal: retirar o migrar el importador `/admin/importar-referencias/legacy` y deshabilitar su ruta cuando termine la compatibilidad. El flujo legacy crea catálogos (por ejemplo telas y líneas), realiza escrituras directas desde el navegador sobre múltiples tablas y no es atómico, por lo que un fallo parcial puede dejar datos incompletos. Mientras exista, debe permanecer separado de la autoridad contractual 029 y restringido a Administrador.
- [ ] [ALTA] PAUSADA temporalmente: la implementación y activación del importador masivo CSV contractual de referencias queda preparada, pero no debe ejecutarse ni aplicarse todavía en staging o producción. La migración 029 no ha sido ejecutada; quedan pendientes la validación PostgreSQL/Supabase y la revisión de integridad y concurrencia. Retomar posteriormente.

### Carta de Colores (creandoFicha.md #3, #4)

- [x] [ALTA] Crear tablas jo.colors y jo.collection_colors en BD
- [x] [ALTA] Seed inicial con ~50 colores de ejemplo
- [x] [ALTA] Dropdown de codigo de color en /ficha-nueva cargado desde carta de coleccion
- [x] [ALTA] Auto-fill del nombre del color al seleccionar codigo
- [ ] [MEDIA] Mejorar Interfaz de gestion de carta de colores en /admin/colecciones
- [x] [MEDIA] Cargar catalogo real de colores (~5000 registros) reemplazando el seed

### Ficha Nueva — Novedades (creandoFicha.md)

- [x] [ALTA] Campo "Referencia #" editable manualmente (entero positivo, validacion de unicidad)
- [x] [ALTA] Campo "Largo Cms" (entero positivo) separado de "Largo" categorico
- [x] [ALTA] Selector de Referente Base con busqueda global por codigo PT/nombre/coleccion
- [x] [ALTA] Persistir referente en references_referents al crear la referencia
- [x] [ALTA] Persistir largo (categorico) → length_description y largoCms → length_cm
- [ ] [MEDIA] Integrar codigos MD/PT manuales desde Excel (los codigos se digitaran de forma manual, actualmente estan en un Excel). Ver rolesJO/creandoFicha.md #7.

## Fase 3: Eficiencia Textil

- [ ] [MEDIA] Vista de comparacion de consumos (creativo vs tecnico vs trazador vs contramuestra)
- [ ] [BAJA] Alertas automaticas cuando consumo contramuestra difiere >5% del trazador
- [ ] [MEDIA] Agregar calculadora de consumo de sesgos por formula (Pendiente: usuario debe proporcionar la formula)
  - Sentido normal → calculo automatico sin trazo (formula pendiente)
  - Sentido "A TRAVEZ" → requiere trazo en Audaces (se registra como trazo normal)
  - Datos requeridos: perimetro, ancho_sesgo, sentido

## Fase 4: Reportes Premium

- [ ] [MEDIA] Dashboard con datos reales desglosados por coleccion (ya muestra totales)
- [ ] [BAJA] Exportar reporte a PDF/Excel desde la app

---

## Fase 5: Preparacion para produccion

- [ ] [ALTA] Diseñar el esquema de base de datos real con migraciones reproducibles, integridad referencial y RLS desde el inicio — RLS/RBAC inicial implementado en 023; falta consolidar el historial de migraciones
- [ ] [ALTA] Definir estrategia de despliegue, variables secretas, dominios autorizados y paso de desarrollo local a produccion

## UI/UX

- [x] [MEDIA] Reemplazar fallback generico "Cargando..." en Suspense por componente reutilizable `AsyncState` con Spinner, error, vacio y reintento
- [x] [ALTA] P2-A: propagar errores de Supabase y estados de carga/vacio/reintento en Dashboard, colecciones, detalle, creativo, trazador, personas, insumos, corte/confeccion e importacion CSV
- [x] [MEDIA] P2-C: mejorar accesibilidad y responsive del shell, Dashboard y Explorador de Colecciones
- [x] [MEDIA] P2-D: optimizar carga inicial, consultas paralelizables y procesamiento de referencias
- [x] [ALTA] P2-E: persistir OT de taller y hand-off de referencias en Supabase — migracion `024_taller_workflow.sql`; requiere ejecutarla en el proyecto

## Calidad y pruebas

- [x] [MEDIA] Preparar infraestructura base de Vitest con scripts `pnpm test` y `pnpm test:run`
- [x] [MEDIA] Crear pruebas progresivas para la aplicacion fuera de `src/state-machine/**` — cobertura inicial en `tests/`
- [x] [ALTA] Validar manualmente Ficha Final despues de ejecutar `migracion/020_ficha_final.sql` y `migracion/021_ficha_final.sql` en Supabase

---

## Herramientas disponibles

| Comando | Funcion |
|---------|---------|
| `python migracion/etl_matriz.py --file "..." --collection XX` | Migrar coleccion via terminal |
| `python migracion/extract_matriz_light.py --input "..."` | Reducir xlsx pesado (quita imagenes) |
| `pnpm dev` | Ejecutar la app en navegador |
