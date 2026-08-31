# Tareas Pendientes — Matriz JO / AtelierData

## Fase 1: Auditoria

- [x] ~~[ALTA] RLS bloquea INSERT/UPDATE en navegador~~ — Corregido: politicas anon agregadas a 30 tablas
- [ ] [ALTA] Agregar autenticacion Supabase Auth (login real) para reemplazar mock de roles
- [x] [ALTA] Implementar ProtectedRoute para validacion de roles en la interfaz — pendiente reemplazar roles mock por roles reales
- [x] [ALTA] Envolver rutas protegidas en App.jsx con ProtectedRoute — proteccion de interfaz completada; no sustituye Auth/RBAC/RLS
- [ ] [ALTA] Definir matriz de permisos: que rol accede a que ruta
- [ ] [ALTA] Implementar RBAC real en servidor usando identidad Auth y roles de base de datos
- [ ] [ALTA] Migrar las politicas RLS de anon a authenticated y aplicar permisos por usuario y rol
- [ ] [ALTA] Relacionar auth.users con user_accounts y persons mediante auth_user_id
- [ ] [ALTA] Exigir JWT y autorizacion por rol en la Edge Function de Google Sheets
- [ ] [ALTA] Restringir CORS de la Edge Function a los origenes autorizados

> Nota: las tareas relacionadas con Google Sheets, CSV y Excel quedan pospuestas durante la etapa de desarrollo local. Se conservaran para la etapa de produccion.

## Fase 2: Segmentacion / Datos

- [x] [ALTA] Migrar colecciones faltantes: FW26, SPRING SUMMER, SUMMER VACATION, PREFALL RTW
- [ ] [MEDIA] Subir consumos masivos desde archivo Excel simplificado (solo REF, ROL, TIPO, VERSION, VALOR)
- [ ] [MEDIA] Formulario individual de consumos en ReferenciaDetalle (agregar/editar/eliminar)
- [ ] [MEDIA] Overlay gris en cards de referencias con estado "Cancelado" para indicarlo visualmente
- [ ] [ALTA] Filtros y busqueda en vista de referencias por año: filtrar por estado (canceladas, en proceso, aprobadas) y buscar por numero, codigo MD/PT o nombre
- [ ] [ALTA] Subir lista real de telas (codigo, descripcion, ancho y foto) desde archivo o formulario masivo

### Carta de Colores (creandoFicha.md #3, #4)

- [x] [ALTA] Crear tablas jo.colors y jo.collection_colors en BD
- [x] [ALTA] Seed inicial con ~50 colores de ejemplo
- [x] [ALTA] Dropdown de codigo de color en /ficha-nueva cargado desde carta de coleccion
- [x] [ALTA] Auto-fill del nombre del color al seleccionar codigo
- [x] [MEDIA] Interfaz de gestion de carta de colores en /admin/colecciones
- [ ] [MEDIA] Cargar catalogo real de colores (~5000 registros) reemplazando el seed

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

- [ ] [ALTA] Diseñar el esquema de base de datos real con migraciones reproducibles, integridad referencial y RLS desde el inicio
- [ ] [ALTA] Definir estrategia de despliegue, variables secretas, dominios autorizados y paso de desarrollo local a produccion

## UI/UX

- [ ] [MEDIA] Reemplazar fallback generico "Cargando..." en Suspense por componente PageSkeleton con Skeleton/Spinner animado

---

## Herramientas disponibles

| Comando | Funcion |
|---------|---------|
| `python migracion/etl_matriz.py --file "..." --collection XX` | Migrar coleccion via terminal |
| `python migracion/extract_matriz_light.py --input "..."` | Reducir xlsx pesado (quita imagenes) |
| `npm run dev` | Ejecutar la app en navegador |
