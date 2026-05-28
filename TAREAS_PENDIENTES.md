# Tareas Pendientes — Matriz JO / AtelierData

## Fase 1: Auditoria

- [x] ~~[ALTA] RLS bloquea INSERT/UPDATE en navegador~~ — Corregido: politicas anon agregadas a 30 tablas
- [ ] [MEDIA] Agregar autenticacion Supabase Auth (login real) para reemplazar mock de roles

## Fase 2: Segmentacion / Datos

- [x] [ALTA] Migrar colecciones faltantes: FW26, SPRING SUMMER, SUMMER VACATION, PREFALL RTW
- [ ] [MEDIA] Subir consumos masivos desde archivo Excel simplificado (solo REF, ROL, TIPO, VERSION, VALOR)
- [ ] [MEDIA] Formulario individual de consumos en ReferenciaDetalle (agregar/editar/eliminar)
- [ ] [MEDIA] Overlay gris en cards de referencias con estado "Cancelado" para indicarlo visualmente
- [ ] [ALTA] Filtros y busqueda en vista de referencias por año: filtrar por estado (canceladas, en proceso, aprobadas) y buscar por numero, codigo MD/PT o nombre
- [ ] [ALTA] Subir lista real de telas (codigo, descripcion, ancho y foto) desde archivo o formulario masivo

## Fase 3: Eficiencia Textil

- [ ] [MEDIA] Vista de comparacion de consumos (creativo vs tecnico vs trazador vs contramuestra)
- [ ] [BAJA] Alertas automaticas cuando consumo contramuestra difiere >5% del trazador

## Fase 4: Reportes Premium

- [ ] [MEDIA] Dashboard con datos reales desglosados por coleccion (ya muestra totales)
- [ ] [BAJA] Exportar reporte a PDF/Excel desde la app

---

## Herramientas disponibles

| Comando | Funcion |
|---------|---------|
| `python migracion/etl_matriz.py --file "..." --collection XX` | Migrar coleccion via terminal |
| `python migracion/extract_matriz_light.py --input "..."` | Reducir xlsx pesado (quita imagenes) |
| `npm run dev` | Ejecutar la app en navegador |
