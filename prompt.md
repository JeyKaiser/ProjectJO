Necesito realizar una evaluación de la metodología de análisis técnico que actualmente tienes definida para este proyecto.

IMPORTANTE:
- NO quiero que realices todavía una nueva auditoría completa del proyecto.
- NO quiero que inventes criterios que no estén contemplados en tu metodología actual.
- NO te voy a proporcionar un checklist externo en este momento.
- Quiero que analices únicamente qué frentes, criterios, verificaciones y evidencias YA contempla tu estructura actual de análisis.
- El objetivo es obtener un informe de inventario de tu metodología actual para posteriormente compararlo con una metodología externa.

## OBJETIVO

Analiza todas las instrucciones, reglas, prompts, archivos de configuración, agentes, skills, documentación y mecanismos que actualmente estén disponibles para ti dentro del proyecto y que definan cómo realizas o deberías realizar una evaluación técnica del software.

Determina exactamente:

1. Qué áreas o frentes de evaluación ya contemplas.
2. Qué subáreas contempla cada frente.
3. Qué criterios específicos evalúas.
4. Qué tipo de evidencia buscas.
5. Qué herramientas o mecanismos utilizas para verificar cada criterio.
6. Qué limitaciones tiene cada evaluación.
7. Qué aspectos mencionas pero no verificas realmente.
8. Qué aspectos NO están contemplados.
9. Qué aspectos aparecen duplicados entre diferentes frentes.
10. Qué aspectos dependen de información externa al repositorio.
11. Qué aspectos no pueden determinarse únicamente mediante análisis estático del código.
12. Qué aspectos requieren ejecución, pruebas, infraestructura, credenciales o intervención humana.

## IMPORTANTE SOBRE EL ANÁLISIS

No agregues nuevos criterios porque consideres que son buenas prácticas.

Debes distinguir claramente entre:

- CONTEMPLADO Y VERIFICABLE
- CONTEMPLADO PARCIALMENTE
- MENCIONADO PERO NO VERIFICABLE
- DEPENDIENTE DE INFORMACIÓN EXTERNA
- NO CONTEMPLADO
- NO DETERMINABLE

Si una capacidad existe únicamente como una recomendación genérica pero no existe un procedimiento concreto para verificarla, clasifícala como:

"MENCIONADO PERO NO VERIFICABLE"

Si no encuentras evidencia de que un frente sea parte de la metodología actual, clasifícalo como:

"NO CONTEMPLADO"

NO asumas que algo está contemplado solo porque el proyecto utiliza una tecnología relacionada.

Por ejemplo:
- Que exista una base de datos NO significa que exista una auditoría de base de datos.
- Que exista autenticación NO significa que exista una auditoría completa de seguridad.
- Que existan tests NO significa que exista una evaluación de calidad de testing.

## PROCEDIMIENTO

Primero realiza un reconocimiento de la estructura actual de análisis.

Identifica:

- archivos de instrucciones
- prompts
- agentes
- reglas
- skills
- documentación
- scripts
- configuraciones
- archivos relacionados con auditoría
- herramientas utilizadas para análisis
- convenciones de salida
- plantillas de informes

Después reconstruye la metodología que actualmente utilizarías para evaluar el sistema.

NO modifiques archivos del proyecto.

NO ejecutes cambios.

NO corrijas problemas del proyecto.

NO implementes recomendaciones.

Esta tarea es exclusivamente de análisis y documentación.

## ÁREAS A IDENTIFICAR

No debes limitarte a estas categorías; úsalas únicamente como referencias para organizar lo encontrado.

Determina si tu metodología actual contempla aspectos relacionados con:

- negocio y procesos
- requerimientos
- arquitectura
- UI/UX
- frontend
- backend
- base de datos
- seguridad
- autenticación
- autorización
- APIs
- integraciones
- rendimiento
- escalabilidad
- calidad del código
- mantenibilidad
- testing
- CI/CD
- DevOps
- infraestructura
- observabilidad
- logging
- monitoreo
- disponibilidad
- resiliencia
- backup
- recuperación
- continuidad
- documentación
- dependencias
- licenciamiento
- cumplimiento
- auditoría
- trazabilidad
- calidad de datos
- sistemas corporativos
- ERP
- SAP
- sistemas industriales / OT
- IoT
- gestión de errores
- concurrencia
- consistencia de datos
- gobernanza técnica

Estas categorías NO deben convertirse automáticamente en criterios de auditoría.

Solo indica si tu metodología actual las contempla o no.

## FORMATO DEL INFORME

Genera UN SOLO INFORME.

Nombre sugerido:

AUDIT_METHODOLOGY_CURRENT_STATE.md

El informe debe tener exactamente esta estructura:

# 1. Resumen ejecutivo

Explica brevemente:

- cuál es la metodología actual identificada
- qué tan amplia es
- cuáles son sus principales fortalezas
- cuáles son sus principales vacíos
- qué tan confiable sería utilizarla para una auditoría corporativa/industrial

# 2. Inventario de fuentes analizadas

Tabla:

| Fuente | Ubicación | Tipo | Propósito | Relevancia |
|---|---|---|---|---|

# 3. Metodología actual reconstruida

Describe paso a paso cómo actualmente se realizaría una evaluación del proyecto según las instrucciones existentes.

# 4. Frentes contemplados

Tabla:

| ID | Frente | Estado | Descripción | Evidencia esperada | Método de verificación |
|---|---|---|---|---|---|

Estados permitidos:

- CONTEMPLADO Y VERIFICABLE
- CONTEMPLADO PARCIALMENTE
- MENCIONADO PERO NO VERIFICABLE
- DEPENDIENTE DE INFORMACIÓN EXTERNA
- NO CONTEMPLADO
- NO DETERMINABLE

# 5. Análisis detallado por frente

Para cada frente encontrado, indicar:

## Nombre del frente

### Qué contempla

Lista concreta de criterios o verificaciones existentes.

### Qué evidencia busca

Archivos, código, configuración, métricas, pruebas, etc.

### Cómo lo verifica

Explicar el procedimiento actual.

### Nivel de profundidad

- Bajo
- Medio
- Alto

### Limitaciones

Qué NO puede determinar actualmente.

### Riesgos de la metodología

Qué podría pasar desapercibido.

# 6. Matriz de cobertura

Construye una matriz donde compares las grandes áreas de una auditoría empresarial contra la cobertura actual de tu metodología.

Columnas:

| Área | Contemplada | Profundidad | Evidencia | Verificación real | Dependencias externas | Observaciones |
|---|---|---|---|---|---|---|

# 7. Criterios explícitamente contemplados

Genera una lista exhaustiva de todos los criterios específicos que realmente aparecen en las instrucciones actuales.

Cada criterio debe indicar:

- ID o nombre
- frente
- qué se verifica
- evidencia
- método
- nivel de profundidad

No inventes IDs si actualmente no existen. Si no existe un ID, utiliza el nombre o ubicación de la regla.

# 8. Criterios mencionados pero no verificables

Identifica todas las áreas donde las instrucciones dicen o sugieren que algo debe revisarse, pero no existe un mecanismo claro para comprobarlo.

# 9. Dependencias externas

Identifica todo lo que no puede determinarse únicamente desde el repositorio.

Ejemplos:

- infraestructura
- configuración de producción
- credenciales
- SAP
- redes
- servidores
- políticas empresariales
- usuarios reales
- cargas reales
- datos reales
- sistemas OT

Solo incluirlos si realmente son una limitación de la metodología encontrada.

# 10. Vacíos de cobertura

Aquí NO propongas todavía una nueva metodología.

Simplemente identifica qué áreas relevantes de una auditoría empresarial/industrial no aparecen contempladas en la metodología actual.

Clasifica cada vacío como:

- Crítico
- Alto
- Medio
- Bajo

Explica por qué es un vacío.

# 11. Duplicidades y solapamientos

Identifica criterios que aparecen repetidos o que son evaluados desde diferentes frentes sin una separación clara.

# 12. Limitaciones metodológicas

Explica los problemas de la metodología actual desde el punto de vista de:

- confiabilidad
- trazabilidad
- reproducibilidad
- evidencia
- profundidad
- cobertura
- falsos positivos
- falsos negativos
- dependencia del contexto
- capacidad de comparación

# 13. Fortalezas actuales

Describe únicamente las fortalezas que puedan demostrarse a partir de la metodología existente.

# 14. Conclusión

Responde:

1. ¿Qué tan completa es la metodología actual?
2. ¿Qué frentes importantes ya cubre?
3. ¿Qué frentes importantes faltan?
4. ¿Dónde tiene mayor profundidad?
5. ¿Dónde tiene mayor debilidad?
6. ¿Qué aspectos requieren herramientas o pruebas externas?
7. ¿Qué tan adecuada sería para una auditoría de una aplicación corporativa e industrial?

# 15. Inventario estructurado para comparación futura

Finaliza con una tabla compacta:

| Frente | Cobertura | Profundidad | Verificable desde repositorio | Requiere ejecución | Requiere infraestructura externa | Observación |
|---|---|---|---|---|---|---|

## REGLA FINAL

El informe debe describir FIELMENTE la metodología que ya existe.

NO intentes hacerla coincidir con una metodología ideal.

NO agregues buenas prácticas que actualmente no estén contempladas.

NO recomiendes todavía cómo mejorarla.

Primero necesito conocer exactamente el estado actual de la metodología.

El resultado será utilizado posteriormente para comparar esta metodología contra otra propuesta de auditoría y determinar:

- qué ya está cubierto
- qué está cubierto parcialmente
- qué está duplicado
- qué falta
- qué debe agregarse
- qué debe profundizarse