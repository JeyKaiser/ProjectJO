# Informe Ejecutivo — Aplicación de Gestión de Colecciones JO

## 1. Resumen ejecutivo

Esta aplicación evoluciona el proceso actual basado en Google Sheets hacia una plataforma web moderna que centraliza la gestión de referencias de prendas, consumos de telas, insumos y fases de producción. El sistema actual está diseñado para asegurar trazabilidad en el ciclo de vida de cada referencia, mejorar la visibilidad de datos y facilitar la transición hacia un backend relacional con Supabase.

El objetivo clave es reemplazar un flujo de trabajo fragmentado en hojas de cálculo con un producto que reduzca errores, mejore las decisiones de compras y producción, y prepare el ecosistema para una migración robusta hacia Postgres/Supabase.

## 2. Problemas que resuelve frente a Google Sheets

### 2.1. Datos planos y complejos
- Google Sheets conserva la información en estructuras de tabla muy densas, con columnas combinadas y más de 60 campos por fila.
- La aplicación reemplaza esa complejidad con un modelo de datos más limpio y con vistas especializadas: dashboard, colecciones, detalle de referencia, consumos, kanban y formularios.

### 2.2. Falta de trazabilidad
- En Sheets la auditoría es manual o implícita, y los cambios no siempre se registran de forma consistente.
- El sistema introduce conceptos como `HISTORIAL` en Sheets y prepara el camino para registros de cambios más fiables en un backend.

### 2.3. Control de roles y permisos
- El uso actual de Google Sheets no provee RBAC robusto; cualquier editor puede cambiar datos críticos.
- La aplicación ya define roles de usuario en `AuthContext` y la lógica de Apps Script soporta roles de `CREATIVO`, `TECNICO`, `TRAZO_Y_CORTE`, `ADMIN` y `CONSULTA`.

### 2.4. Validación y consistencia
- En Sheets, es fácil introducir consumos erróneos, valores nulos o datos incompatibles entre áreas.
- La aplicación y los scripts adjuntos agregan validaciones automáticas: control de consumos, comparaciones costeo vs contramuestra, y alertas cuando las diferencias superan el 5%.

### 2.5. Escalabilidad y mantenimiento
- El modelo de dos archivos por colección es difícil de escalar y mantener para múltiples colecciones y cápsulas.
- La solución propuesta guía la migración a 9 hojas relacionales y, eventualmente, a una base de datos centralizada, lo que mejora la escalabilidad y reduce la duplicación de datos.

## 3. Stack tecnológico actual

### Frontend
- React 19.2.5
- Vite 8.0.12
- React Router DOM 7.14.2
- Lucide React para iconografía
- CSS puro con estilos personalizados
- `xlsx` para import/export de datos

### Backend / Persistencia
- Actualmente, la aplicación usa `localStorage` para persistencia local de usuario y rol.
- El ecosistema está preparado para integrarse con Supabase a través de `@supabase/supabase-js`.

### Integraciones externas
- Google Sheets + Apps Script para automatizaciones y validaciones en el flujo actual.
- Google Drive para gestión de imágenes en el sistema de hojas de cálculo.
- Scripts Python en `migracion/` y `migrar_datos.py` para ETL y migración de datos.

### Herramientas de desarrollo
- Node.js / Vite
- ESLint (`eslint.config.js`) para calidad de código
- Git para control de versiones

## 4. Arquitectura actual

### 4.1. Frontend
- `src/main.jsx` monta la aplicación con `BrowserRouter` y `AuthProvider`.
- `src/App.jsx` define rutas principales y balancea carga con componentes `lazy` para vistas menos frecuentes.
- La UI se organiza en `components/` y `pages/`, con una separación clara entre navegación, layout y contenido.

### 4.2. Estado y contexto
- `src/context/AuthContext.jsx` gestiona el rol de usuario.
- El rol se guarda en `localStorage` y se expone con helpers tipo `isAdmin`, `isCreativo`, `isTecnico`, etc.

### 4.3. Persistencia de datos
- El sistema actual no tiene un backend centralizado; depende de `localStorage` para valores de rol y posiblemente para datos de sesión.
- El diseño apunta a un futuro donde Supabase proveerá autenticación, almacenamiento y políticas de acceso.

### 4.4. Google Sheets como capa de negocio
- `apps_script/Code.gs` implementa un entorno de control de accesos, validación de datos, auto-completar desde `PARAMETROS`, historial automático y comparación de consumos.
- El modelo de Sheets propuesto en `README_ATELIERDATA.md` simplifica el esquema a 9 hojas relacionales: `REFERENCIAS`, `TELAS_X_REFERENCIA`, `CONSUMOS`, `CONSUMOS_CONTRAMUESTRA`, `INSUMOS`, `PARAMETROS`, `HISTORIAL`, `ALERTAS`, `RESUMEN`.

### 4.5. Flujo de datos ideal
- Usuario interactúa con la app -> React maneja navegación y componentes -> datos sincronizan con backend (localStorage actual / Supabase futuro).
- Donde el flujo se integra con Google Sheets, Apps Script realiza validaciones en origen y mantiene un `HISTORIAL` de cambios.

## 5. Patrones de diseño identificados

### 5.1. Componentización y lazy loading
- Las páginas principales (`Dashboard`, `ColeccionesExplorer`, `ReferenciaDetalle`) se importan de forma directa.
- Las vistas secundarias se cargan con `React.lazy`, mejorando tiempos de carga y distribuyendo el bundle.

### 5.2. Contexto para estado compartido
- `AuthContext` es el patrón de `React Context` para compartir información de rol en todo el árbol de componentes.

### 5.3. Separación de responsabilidades
- Rutas y layout (`App.jsx`) separadas del estado de autenticación (`AuthContext`) y del contenido de páginas.
- Google Apps Script se usa como capa de reglas de negocio y automatización del modelo actual de Google Sheets.

### 5.4. Propuesta de modelo relacional
- La documentación sugiere migrar desde un esquema plano a un diseño relacional claramente normalizado.
- Las operaciones de ETL en `migrar_datos.py` y `migracion/etl_supabase.py` son coherentes con una arquitectura de datos separada de la UI.

## 6. Mejoras faltantes y roadmap

### 6.1. Autenticación real y RBAC
- `TAREAS_PENDIENTES.md` identifica como pendiente crítico la integración de Supabase Auth.
- Actualmente se usa un mock de roles guardado en `localStorage`, lo que es insuficiente para producción.

### 6.2. Migración completa a Supabase/Postgres
- Ya existe un plan en `IMPLEMENTATION_GUIDE.md` para trasladar el modelo a Postgres y aprovechar Supabase.
- Faltan la creación de tablas definitivas, la carga de datos reproducible y la verificación de políticas RLS.

### 6.3. Persistencia y sincronización
- La aplicación debe pasar de `localStorage` a un backend centralizado para evitar inconsistencias entre sesiones y usuarios.
- Se necesita soporte para cargas masivas de consumos y sincronización en tiempo real o casi real.

### 6.4. Mejora de UX y reportes
- Faltan vistas críticas como comparación de consumos (creativo vs técnico vs trazador vs contramuestra).
- El dashboard debe mostrar datos reales desglosados por colección, y faltan exportes a PDF/Excel.

### 6.5. Gestión de catálogos y contenido maestro
- Es necesaria la carga masiva de telas, parámetros y catálogos desde archivos o APIs.
- También falta un formulario robusto para editar consumos por referencia.

## 7. Riesgos de seguridad

### 7.1. Ausencia de autenticación segura
- El sistema actual no cuenta con un login real; el rol de usuario se almacena en `localStorage`.
- Esto expone al sistema a suplantación y a cambios no autorizados en el frontend.

### 7.2. Dependencia de localStorage
- `localStorage` no es una fuente segura ni resistente a manipulación por parte del usuario.
- La confidencialidad e integridad de la aplicación dependen de un mecanismo de backend inexistente.

### 7.3. Dependencia de Google Apps Script y permisos de Sheets
- La automatización en `apps_script/Code.gs` depende de que los correos y permisos de Google estén configurados correctamente.
- Si los roles de correo o la hoja se migran, se debe validar que el script siga funcionando y que no quede acceso abierto.

### 7.4. Ausencia de políticas de acceso de datos en backend
- Aunque existen políticas anon en el histórico, todavía no hay un backend centralizado con RLS aplicable a usuarios reales.
- El sistema necesita políticas de acceso por rol, validación de operaciones y control de datos sensibles como consumos y costos.

### 7.5. Exposición de datos en hojas compartidas
- El uso actual de Google Sheets implica que usuarios con acceso a las hojas pueden ver datos sensibles.
- Es necesario proteger el acceso a las hojas y mitigar el riesgo de ediciones accidentales o maliciosas.

## 8. Detalles relevantes de negocio

### 8.1. Manejo por colección y cápsulas
- El proceso es multi-colección: `WINTER SUN`, `RESORT RTW`, `SPRING SUMMER`, `SUMMER VACATION`, `PREFALL RTW`, `FALL WINTER`.
- Cada colección se gestiona como un conjunto de referencias, telas, consumos e insumos.

### 8.2. Ciclo de vida de referencia
- La referencia se inicia como muestra con un código `MD`.
- Tras aprobación se convierte en producto terminado `PT`.
- El proceso involucra diseñador creativo, diseñador técnico, trazo y corte, modista y supervisión de calidad.

### 8.3. Estructura de datos actual en Sheets
- `MATRIZ` concentra datos en una fila por referencia, con áreas separadas por secciones: creativo, técnico y trazador.
- `PARAMETROS` guarda catálogos maestros para dropdowns.
- El documento actual es vulnerable a errores por la densidad de columnas y el uso de celdas combinadas.

### 8.4. Mejora propuesta de AtelierData
- El documento `README_ATELIERDATA.md` propone 9 hojas relacionales que abstraen los datos en entidades: referencias, telas, consumos, insumos, parámetros, historial, alertas y resumen.
- Este modelo es más sostenible y permite reglas de negocio automáticas, comparaciones y reportes estructurados.

## 9. Recomendaciones clave

### 9.1. Prioridad inmediata
- Implementar Supabase Auth y reemplazar `localStorage` para roles.
- Consolidar la migración de la estructura actual de Google Sheets hacia el modelo relacional propuesto.
- Establecer reglas de negocio en el backend y no solo en Apps Script.

### 9.2. Recomendaciones de seguridad
- Usar RLS en Supabase con roles definidos para el ciclo de producción.
- Mantener las hojas de cálculo solo como origen temporal de datos o como interfaz de migración, no como fuente de verdad en producción.
- Asegurar los scripts de Google Apps Script con acceso limitado y validación de usuarios.

### 9.3. Recomendaciones de producto
- Añadir comparadores de consumos y alertas de desviación >5% directamente en la app.
- Mejorar la visualización de estados: cancelada, en proceso, aprobada, muestra, producción.
- Habilitar cargas masivas de parámetros y telas para acelerar la operación de colecciones.

## 10. Conclusión

La aplicación tiene una base sólida para transformar un proceso textil complejo en una plataforma más ordenada y menos propensa a errores. El valor principal ya está en la separación de vistas, en la priorización de roles y en la migración hacia un modelo relacional. Sin embargo, para cerrar el ciclo es urgente avanzar en autenticación real, backend centralizado y en una estrategia de datos que retire gradualmente la dependencia de Google Sheets como sistema operativo.

El siguiente paso recomendado es ejecutar la migración piloto hacia Supabase, implementar Auth y validar los casos de uso críticos de consumos y alertas en la aplicación.
