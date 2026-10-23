# L3-v7 — piloto SS27 aislado (evolución de L3-v5)

**Estado:** APROBADA por el usuario; implementación en revisión, **NOT_VALIDATED** en BD.
**Ámbito:** un clon aislado SS27 aún no aprovisionado ni verificado. Ningún script
de este cambio se ha ejecutado. No autoriza importación, borrado ni promoción
de datos hacia la BD real. `029` permanece pausada.

| Requisito | Regla aprobada | Implementación prevista |
|---|---|---|
| L3-FIC-01 | Tipo concreto obligatorio para ficha nueva; catálogo `jo.tipo_prendas` administrado solo por Admin; históricos sin autoconversión. Legacy enum permanece. | 030, hooks, ficha, configuración, detalle, vista final. |
| L3-FIC-02 | `tipo_ref` desde línea; `''` sin línea; línea opcional, sublínea exige línea. | 030, API, ficha. CSV-010. |
| L3-FIC-03 | Solo Admin elige/cambia estado general en TODAS las colecciones; cambios de otros campos siguen los permisos existentes. | 030, API, detalle. |
| L3-FIC-04 | Comercial, Complejidad y Empaque independientes; blancos NULL, maquilas independientes, booleans false, montaje opcional normalizado. | ficha, 030. No se crean subfases automáticamente. |
| L3-WF-01 | Autoridad temporal A1: solo Admin activo opera transiciones SS27 por RPC; no se infieren líderes ni áreas. | 031, servicio de transición. |
| L3-WF-02 | M1: fork cancelado resuelto; merge automático/atómico tras último fork; historial append-only. | 031. |
| L3-WF-03 | Cancelación global: episodio con snapshot de forks activos; restauración exacta; sin snapshot fiable: revisión manual. | 031; 028 permanece aplicado y 029 no requerido. |
| L3-OPS-01 | Clon de proyecto/config distinto. Un filtro Vite no separa proyectos ni impone seguridad: alcance se verifica en RPC por colección y año. | preflight externo + 030/031; NO aprovisionado. |
| L3-OPS-02 | Aunque el clon contenga referencias antiguas de otras colecciones, el piloto no permite altas nuevas fuera de SS27. El guard de INSERT no bloquea UPDATE no-status fuera de SS27; Admin sigue pudiendo editar status general global. | 030 + UI piloto; NOT_VALIDATED DB. |
| L3-v7-F01 | Alta globalmente cancelada inicializa concepto y deja snapshot cero forks e historial INIT+cancelación; reactivación restaura concepto. | RPC core 031; NOT_VALIDATED DB. |
| L3-v7-F02/R1/M1/C1 | Tronco avanza con forks activos; resolver fork individual desde tronco posterior conserva tronco/hermanos; rechazo solo fork CANCELADO; unión única automática al último resuelto; Comercial no cierra con fork activo. | RPC 031 + acciones UI; NOT_VALIDATED DB. |
| L3-v7-F03 | Core de ficha, montaje y referente en una transacción; MD/PT opcionales poscommit y retry por código faltante. Includes/equipo/boceto retirados provisionalmente, sin payload oculto. | Ficha/API, core 031 y fachada 032; NOT_VALIDATED DB. |
| L3-v7-F04/F06 | Ocultar acciones de forks resueltos; un histórico sin FK muestra clasificación pendiente y el enum solo como pista histórica. | UI/API. |
| L3-v7-F05/F07 | Montaje por lote, rendimiento a medir; SQL/RLS/JWT exclusivamente usuario en clon posterior. | NO VALIDADO runtime. |
| L3-v7-R02/R04 | Un mismo UUID de alta se serializa antes de consultar receipt y PK evita duplicados; las listas se filtran por colección/año en servidor antes de paginar, la búsqueda usa nombres/números y códigos PT realmente asignados. | 031 + API; concurrencia, joins y latencia NOT_VALIDATED runtime. |
| L3-v7-F03-result | Reintento de alta por mismo actor/UUID/payload retorna resultado original incluso tras edición; ningún backfill inferido de recibos previos. | 032 NO-RUN tras 031, exige receipts vacíos, fachada pública 032; pruebas runtime NOT_VALIDATED. |
| L3-v7-ACL/alertas | Core 031 sin EXECUTE para PUBLIC/anon/authenticated desde su instalación; fachada 032 concedida únicamente al final de su transacción. Inbox y alertas piloto filtran SS27/2027 en servidor, paginan estados y cargan detalles por lote. | 031/032, servicio de inbox y alertas; privilegios, RLS, joins y latencia runtime NOT_VALIDATED. |

## Decisión/historial

1. L3-v3: aprobada dirección hacia piloto aislado, sin autorización de borrado ni importación en BD real.
2. L3-v5: aprobadas A1 (Admin directo **temporal en piloto SS27**) y M1 (merge automático; cancelación de fork resuelta). La definición evento/estado/fork→área y líder↔referencia/fork se pospone expresamente.
3. `reference_type` permanece en BD hasta una aprobación posterior; no hay migración destructiva. Las 11 referencias históricas permanecen sin clasificación automática.
4. La validación de credenciales y la importación de datos piloto se posponen. No se asume ni afirma que el clon exista.
5. L3-v7 FINAL: aprobadas correcciones F01-F07; Includes, equipo y boceto se retiran de la ficha nueva hasta definir contrato. 030/031 son scripts nuevos NO aplicados, no se ejecutaron.

**Evidencia pendiente:** verificación con JWT de cuentas autorizadas y no autorizadas,
colisiones de versiones/idempotencia, rollback transaccional, cancelación múltiple,
restauración histórica, privilegios efectivos y concurrencia real en el clon.

**Runbook condicional:** [`../../docs/piloto-ss27-operacion.md`](../../docs/piloto-ss27-operacion.md).
