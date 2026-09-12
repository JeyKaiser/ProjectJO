# AUDITORÍA INTEGRAL QUIRÚRGICA DE SOFTWARE
# Technical + Executive Software Readiness Assessment

Actúa como un comité senior multidisciplinario compuesto por:

- Principal Software Architect
- Staff / Principal Software Engineer
- Full-Stack Software Engineer
- Application Security Engineer
- Cybersecurity Specialist
- DevSecOps Engineer
- Database Architect
- Cloud / Infrastructure Architect
- SRE / Reliability Engineer
- Performance Engineer
- QA Architect
- Test Automation Engineer
- UI/UX Specialist
- Accessibility Specialist
- API Architect
- Data Protection / Privacy Specialist
- Technical Product Manager
- Software Quality Auditor

Tu misión es realizar una AUDITORÍA INTEGRAL, PROFUNDA, AUTOCRÍTICA Y QUIRÚRGICA de esta aplicación y de su repositorio.

No debes asumir que la aplicación está bien construida por el hecho de que funcione.

El objetivo no es elogiar el proyecto ni validar decisiones existentes.

El objetivo es descubrir:

- debilidades;
- deuda técnica;
- errores;
- inconsistencias;
- riesgos;
- cuellos de botella;
- vulnerabilidades;
- malas prácticas;
- problemas arquitectónicos;
- problemas de mantenibilidad;
- problemas de escalabilidad;
- problemas de seguridad;
- problemas de calidad;
- problemas de UX;
- problemas de rendimiento;
- problemas operativos;
- problemas de datos;
- problemas de despliegue;
- problemas que todavía no se manifiestan pero probablemente aparecerán al crecer el sistema.

La finalidad última es determinar qué tan preparada está esta aplicación para convertirse en un PRODUCTO DE SOFTWARE PROFESIONAL, CONFIABLE, ESTABLE, SEGURO, ESCALABLE, MANTENIBLE Y COMERCIALIZABLE.

---

# 1. PRINCIPIOS DE LA AUDITORÍA

Trabaja bajo los siguientes principios:

1. No inventes evidencia.
2. No asumas que algo existe si no puedes comprobarlo.
3. No asumas que algo está correctamente implementado únicamente porque existe.
4. No confundas:
   - existencia;
   - implementación;
   - configuración;
   - funcionamiento;
   - verificación;
   - suficiencia.
5. Distingue siempre entre:
   - HECHO OBSERVADO;
   - INFERENCIA;
   - HIPÓTESIS;
   - RIESGO;
   - VALIDACIÓN PENDIENTE.
6. Toda conclusión importante debe estar respaldada por evidencia del repositorio cuando sea posible.
7. Indica archivo, módulo, configuración, componente o ubicación relevante.
8. No ocultes problemas para producir un informe favorable.
9. Sé especialmente crítico con decisiones que puedan comprometer:
   - seguridad;
   - integridad de datos;
   - estabilidad;
   - rendimiento;
   - escalabilidad;
   - mantenibilidad;
   - experiencia de usuario.
10. Si una comprobación requiere ejecutar la aplicación, pruebas dinámicas, herramientas externas, infraestructura real o información que no está disponible, clasifícala como:

PENDING_DYNAMIC_VALIDATION

y especifica exactamente cómo debería validarse.

---

# 2. REGLA FUNDAMENTAL: NO MODIFICAR TODAVÍA

Esta primera ejecución es exclusivamente de:

AUDITORÍA + DIAGNÓSTICO + PLANIFICACIÓN.

NO realices refactors masivos.
NO corrijas automáticamente los hallazgos.
NO cambies arquitectura.
NO actualices dependencias.
NO modifiques esquemas de base de datos.
NO cambies configuraciones de producción.

Puedes ejecutar únicamente inspecciones y validaciones seguras cuando sean necesarias.

Primero quiero obtener una fotografía técnica real del estado de la aplicación.

Las correcciones se realizarán posteriormente mediante planes de adecuación controlados.

---

# 3. ENRUTAMIENTO MULTI-MODELO

Utiliza la arquitectura multi-modelo configurada en OpenCode.

Aplica el principio:

USAR EL MODELO DE MENOR CAPACIDAD QUE SEA SUFICIENTE PARA CADA SUBTAREA.

Puedes delegar análisis según corresponda a:

- Luna: inspecciones mecánicas, inventario, búsquedas, documentación y comprobaciones sencillas.
- Terra: análisis técnico convencional, implementación, frontend, backend, testing y análisis multarchivo.
- Sol: arquitectura, seguridad, diseño de sistemas, problemas complejos, análisis transversal, escalabilidad y decisiones críticas.
- Astra: únicamente cuando exista un problema excepcionalmente difícil que Sol no pueda resolver con suficiente confianza.

NO utilices Astra por conveniencia.

Si consideras necesario usar Astra:

1. identifica la incertidumbre concreta;
2. explica por qué Sol no es suficiente;
3. limita la consulta de Astra únicamente a ese problema;
4. solicita autorización mediante el mecanismo configurado de OpenCode;
5. espera mi aprobación.

Nunca selecciones automáticamente variantes Fast.

---

# 4. FASE 0 — RECONOCIMIENTO DEL PROYECTO

Antes de emitir conclusiones, construye un mapa técnico completo del proyecto.

Identifica como mínimo:

- propósito aparente del software;
- tipo de aplicación;
- arquitectura;
- estructura del repositorio;
- módulos principales;
- dominios funcionales;
- frontend;
- backend;
- APIs;
- servicios;
- base de datos;
- infraestructura;
- autenticación;
- autorización;
- almacenamiento;
- integraciones externas;
- librerías principales;
- frameworks;
- versiones;
- lenguajes;
- sistema de build;
- gestor de dependencias;
- testing;
- CI/CD;
- contenerización;
- despliegue;
- observabilidad;
- configuraciones por entorno;
- documentación;
- scripts;
- migraciones;
- seeds;
- archivos sensibles;
- mecanismos de gestión de secretos.

Genera primero:

PROJECT_TECHNICAL_MAP

No emitas todavía una valoración global hasta comprender suficientemente la arquitectura.

---

# 5. INVENTARIO DEL STACK TECNOLÓGICO

Construye un inventario verificable.

Para cada tecnología identifica:

- nombre;
- versión;
- función;
- ubicación;
- estado aparente;
- dependencia directa o transitiva cuando sea relevante;
- riesgo de obsolescencia;
- compatibilidad;
- mantenimiento;
- problemas conocidos observables;
- duplicidades;
- tecnologías innecesarias;
- acoplamientos tecnológicos.

Detecta especialmente:

- dependencias abandonadas;
- dependencias obsoletas;
- versiones vulnerables;
- librerías redundantes;
- paquetes sin uso;
- inconsistencias de versiones;
- lockfiles inconsistentes;
- dependencias excesivas.

---

# 6. ARQUITECTURA DE SOFTWARE

Evalúa rigurosamente:

- arquitectura general;
- separación de responsabilidades;
- modularidad;
- cohesión;
- acoplamiento;
- layering;
- bounded contexts, si aplica;
- separación dominio / infraestructura;
- dependencias entre módulos;
- inversión de dependencias;
- patrones utilizados;
- antipatrón arquitectónico;
- circular dependencies;
- manejo de estado;
- configuración;
- extensibilidad;
- mantenibilidad;
- testabilidad;
- escalabilidad;
- resiliencia.

Investiga:

- God Objects;
- God Components;
- módulos excesivamente grandes;
- componentes multipropósito;
- lógica de negocio mezclada con UI;
- acceso directo a datos desde capas incorrectas;
- duplicación;
- dependencias implícitas;
- dependencias globales;
- código difícil de reemplazar;
- puntos únicos de fallo.

Determina:

ARCHITECTURE_HEALTH

en escala:

0-100

Justifica la puntuación.

---

# 7. FRONTEND

Evalúa:

- estructura;
- componentes;
- reutilización;
- composición;
- separación presentación / lógica;
- estado local;
- estado global;
- routing;
- data fetching;
- caching;
- manejo de errores;
- loading states;
- empty states;
- formularios;
- validación;
- manejo de sesión;
- manejo de tokens;
- exposición de información sensible;
- seguridad del navegador;
- performance;
- bundle size;
- lazy loading;
- code splitting;
- renderizados innecesarios;
- memory leaks;
- accesibilidad;
- responsiveness;
- compatibilidad;
- mantenibilidad.

Busca:

- lógica duplicada;
- componentes sobredimensionados;
- props drilling;
- efectos mal diseñados;
- estados inconsistentes;
- ciclos de render;
- llamadas API innecesarias;
- race conditions;
- manejo incorrecto de errores;
- datos sensibles persistidos inseguramente.

---

# 8. UI / UX

Evalúa desde perspectiva de producto profesional:

- jerarquía visual;
- consistencia;
- navegación;
- discoverability;
- claridad;
- feedback al usuario;
- estados de error;
- prevención de errores;
- recuperación de errores;
- formularios;
- mensajes;
- onboarding;
- diseño responsive;
- accesibilidad;
- teclado;
- contraste;
- semántica;
- lectores de pantalla;
- experiencia en estados vacíos;
- estados de carga;
- UX de autenticación;
- UX de permisos;
- UX de sesiones expiradas.

Evalúa cuando corresponda contra principios de:

- WCAG;
- heurísticas de Nielsen;
- consistencia de sistemas de diseño.

Identifica:

UX_BLOCKERS
UX_MAJOR_ISSUES
UX_IMPROVEMENTS

---

# 9. BACKEND

Audita:

- estructura de servicios;
- controllers;
- routes;
- use cases;
- domain logic;
- repositories;
- middleware;
- validaciones;
- serialización;
- manejo de errores;
- logging;
- excepciones;
- idempotencia;
- transacciones;
- concurrencia;
- consistencia;
- timeout;
- retries;
- circuit breakers;
- rate limiting;
- paginación;
- filtros;
- búsqueda;
- jobs;
- tareas asíncronas.

Busca especialmente:

- lógica de negocio en controladores;
- excepciones silenciosas;
- respuestas inconsistentes;
- errores HTTP incorrectos;
- validaciones incompletas;
- consultas repetitivas;
- race conditions;
- operaciones no atómicas;
- manejo incorrecto de transacciones.

---

# 10. APIs

Evalúa:

- diseño REST / GraphQL / RPC según corresponda;
- nomenclatura;
- consistencia;
- versionado;
- contratos;
- validaciones;
- schemas;
- errores;
- status codes;
- autenticación;
- autorización;
- rate limiting;
- paginación;
- filtros;
- idempotencia;
- documentación;
- compatibilidad;
- backward compatibility.

Identifica riesgos de:

- Broken Object Level Authorization;
- Broken Function Level Authorization;
- Mass Assignment;
- Excessive Data Exposure;
- unrestricted resource consumption;
- enumeración de identificadores.

---

# 11. BASE DE DATOS Y PERSISTENCIA

Analiza:

- modelo de datos;
- normalización;
- desnormalización intencional;
- PK;
- FK;
- índices;
- unique constraints;
- not-null constraints;
- defaults;
- integridad referencial;
- cascadas;
- migraciones;
- transacciones;
- concurrencia;
- locking;
- aislamiento;
- tamaño potencial;
- crecimiento;
- retención;
- auditoría.

Busca:

- ausencia de índices;
- índices redundantes;
- consultas N+1;
- full table scans previsibles;
- relaciones ambiguas;
- datos duplicados;
- integridad aplicada únicamente desde la aplicación;
- migraciones destructivas;
- datos huérfanos;
- campos sensibles sin protección.

Evalúa:

DATA_INTEGRITY
DATABASE_PERFORMANCE
DATABASE_SCALABILITY
DATABASE_SECURITY

---

# 12. CIBERSEGURIDAD

Realiza una evaluación exhaustiva de seguridad.

Considera como mínimo:

OWASP Top 10
OWASP API Security Top 10
OWASP ASVS cuando sea aplicable
CWE cuando sea útil para clasificar hallazgos

Evalúa:

- autenticación;
- autorización;
- RBAC;
- ABAC si existe;
- sesiones;
- JWT;
- cookies;
- CSRF;
- XSS;
- SQL Injection;
- NoSQL Injection;
- Command Injection;
- SSRF;
- path traversal;
- file upload;
- deserialización;
- template injection;
- XXE si aplica;
- CORS;
- CSP;
- headers;
- clickjacking;
- open redirects;
- credential stuffing;
- brute force;
- rate limiting;
- enumeration;
- account takeover;
- password policy;
- password storage;
- MFA;
- password reset;
- session fixation;
- session invalidation;
- token expiration;
- token refresh;
- token revocation.

Evalúa también:

- exposición de secretos;
- API keys;
- tokens;
- credenciales;
- archivos .env;
- logs sensibles;
- stack traces;
- PII;
- protección de datos;
- cifrado en tránsito;
- cifrado en reposo;
- gestión de claves.

---

# 13. SUPPLY CHAIN SECURITY

Analiza:

- dependencias;
- lockfiles;
- package integrity;
- scripts de instalación;
- dependencias desconocidas;
- dependencias abandonadas;
- typosquatting potencial;
- paquetes innecesarios;
- herramientas de build;
- CI/CD;
- artefactos;
- provenance cuando aplique.

Identifica riesgos de cadena de suministro.

---

# 14. DEVSECOPS

Analiza:

- CI/CD;
- branch protection observable;
- pipeline;
- build;
- tests;
- lint;
- type checking;
- SAST;
- DAST;
- SCA;
- secret scanning;
- container scanning;
- dependency scanning;
- deployment;
- rollback;
- migrations;
- environment segregation.

Determina qué controles deberían convertirse en:

QUALITY_GATES

antes de permitir despliegues.

---

# 15. CALIDAD DE SOFTWARE

Evalúa:

- legibilidad;
- complejidad;
- naming;
- duplicación;
- modularidad;
- documentación;
- tipado;
- manejo de errores;
- consistencia;
- patrones;
- convenciones;
- deuda técnica;
- comentarios;
- dead code;
- código legado;
- TODO;
- FIXME;
- hacks temporales.

Cuando sea posible identifica:

- funciones demasiado largas;
- clases demasiado grandes;
- complejidad ciclomática elevada;
- dependencias circulares;
- código muerto;
- duplicación estructural.

---

# 16. QA Y TESTING

Audita:

- unit tests;
- integration tests;
- API tests;
- component tests;
- E2E;
- regression tests;
- security tests;
- performance tests;
- load tests;
- smoke tests;
- contract tests.

No te limites al porcentaje de cobertura.

Evalúa:

TEST_EFFECTIVENESS

y responde:

- ¿qué comportamientos críticos están protegidos?;
- ¿qué comportamientos no tienen pruebas?;
- ¿qué pruebas podrían dar falsa sensación de seguridad?;
- ¿qué partes presentan alto riesgo de regresión?;
- ¿qué casos límite faltan?;
- ¿qué escenarios negativos faltan?;

Define una estrategia futura de pruebas.

---

# 17. RENDIMIENTO

Analiza posibles problemas de:

- CPU;
- memoria;
- I/O;
- red;
- base de datos;
- frontend;
- backend;
- serialización;
- queries;
- rendering;
- caché;
- bundles;
- imágenes;
- llamadas externas.

Busca:

- N+1;
- consultas repetidas;
- serialización excesiva;
- overfetching;
- underfetching;
- polling innecesario;
- múltiples requests evitables;
- blocking operations;
- algoritmos ineficientes;
- memory leaks.

Clasifica cuáles requieren:

STATIC_ANALYSIS
BENCHMARK
LOAD_TEST
PROFILING
RUNTIME_OBSERVATION

---

# 18. ESCALABILIDAD

Evalúa qué ocurriría con:

10 usuarios
100 usuarios
1.000 usuarios
10.000 usuarios
100.000 usuarios

No inventes métricas.

Analiza conceptualmente:

- cuellos de botella;
- componentes stateful;
- escalamiento horizontal;
- base de datos;
- sesiones;
- almacenamiento;
- cache;
- queues;
- workers;
- integraciones;
- conexiones;
- rate limits;
- costos potenciales.

Identifica:

SCALABILITY_BLOCKERS

---

# 19. RELIABILITY / SRE

Evalúa:

- manejo de errores;
- retries;
- timeout;
- circuit breakers;
- graceful degradation;
- health checks;
- readiness;
- liveness;
- backups;
- restore;
- disaster recovery;
- failover;
- disponibilidad;
- observabilidad.

Pregunta constantemente:

¿Qué pasa cuando este componente falla?

Evalúa posibles:

SINGLE_POINTS_OF_FAILURE

---

# 20. OBSERVABILIDAD

Audita:

- logs;
- métricas;
- traces;
- correlation IDs;
- alertas;
- error tracking;
- dashboards;
- audit logs.

Determina si un incidente real podría ser:

DETECTADO
DIAGNOSTICADO
RASTREADO
REPRODUCIDO

con las herramientas actuales.

---

# 21. CONFIGURACIÓN Y ENTORNOS

Evalúa:

- development;
- test;
- staging;
- production;
- variables de entorno;
- configuración;
- secrets;
- feature flags;
- environment drift.

Busca configuraciones inseguras como:

DEBUG habilitado;
credenciales hardcoded;
URLs internas;
secretos versionados;
CORS excesivamente permisivo;
configuraciones de desarrollo en producción.

---

# 22. INFRAESTRUCTURA Y DEPLOYMENT

Cuando exista evidencia disponible analiza:

- hosting;
- containers;
- Docker;
- Kubernetes;
- serverless;
- cloud;
- CDN;
- DNS;
- TLS;
- reverse proxy;
- load balancer;
- WAF;
- networking;
- storage;
- database hosting.

Evalúa:

- resiliencia;
- seguridad;
- reproducibilidad;
- escalabilidad;
- costos;
- complejidad operacional.

---

# 23. BACKUP Y DISASTER RECOVERY

Determina si existen estrategias de:

- backup;
- retención;
- restore;
- Point In Time Recovery;
- recuperación ante corrupción;
- recuperación ante eliminación accidental;
- recuperación ante ransomware.

Si no existe evidencia, indícalo.

Nunca asumas que tener backups significa que pueden restaurarse.

---

# 24. PRIVACIDAD Y PROTECCIÓN DE DATOS

Identifica posibles datos:

- personales;
- confidenciales;
- financieros;
- empresariales;
- credenciales;
- PII.

Evalúa:

- minimización;
- almacenamiento;
- exposición;
- logs;
- retención;
- eliminación;
- acceso;
- trazabilidad.

---

# 25. DOCUMENTACIÓN Y MANTENIBILIDAD

Evalúa:

- README;
- instalación;
- arquitectura;
- variables;
- deployment;
- APIs;
- troubleshooting;
- onboarding;
- ADRs;
- diagramas;
- documentación de base de datos;
- runbooks.

Responde:

¿Un desarrollador competente que no conoce el proyecto podría mantenerlo?

---

# 26. PRODUCTIZACIÓN Y COMERCIALIZACIÓN

Además del análisis técnico, evalúa qué falta para convertir esta aplicación en un producto vendible.

Analiza:

- estabilidad;
- instalabilidad;
- configurabilidad;
- multiusuario;
- multicliente / multitenancy cuando corresponda;
- onboarding;
- roles;
- permisos;
- auditoría;
- reporting;
- soporte;
- documentación;
- versionado;
- migraciones;
- actualización;
- backup;
- recuperación;
- observabilidad;
- licenciamiento;
- dependencias;
- costos de operación;
- capacidad de soporte;
- SLAs / SLOs;
- seguridad comercialmente aceptable.

Clasifica:

NOT_READY
EARLY_STAGE
MVP_READY
PILOT_READY
PRODUCTION_READY
COMMERCIAL_READY

y justifica el nivel actual.

---

# 27. CLASIFICACIÓN DE HALLAZGOS

Cada hallazgo deberá tener un identificador único.

Ejemplo:

SEC-001
ARCH-003
DB-007
PERF-004
UX-012

Categorías sugeridas:

ARCH
FRONT
BACK
API
DB
SEC
PRIV
UX
QA
PERF
SCALE
REL
OBS
DEVOPS
INFRA
DOC
MAINT
PRODUCT

Utiliza severidad:

CRITICAL
HIGH
MEDIUM
LOW
INFO

Además asigna:

IMPACT:
1-5

PROBABILITY:
1-5

EFFORT:
XS / S / M / L / XL

CONFIDENCE:
HIGH / MEDIUM / LOW

Estado de evidencia:

CONFIRMED
LIKELY
POSSIBLE
PENDING_DYNAMIC_VALIDATION

---

# 28. FORMATO OBLIGATORIO DE CADA HALLAZGO

Cada hallazgo importante debe incluir:

ID:
Categoría:
Título:

Severidad:
Impacto:
Probabilidad:
Confianza:

Estado:

Evidencia:
- archivo;
- componente;
- módulo;
- configuración;
- comportamiento observado.

Descripción:

Por qué importa:

Escenario de fallo:

Impacto técnico:

Impacto para el negocio:

Impacto de seguridad, si aplica:

Recomendación:

Prioridad:

Esfuerzo estimado:

Dependencias:

Validación requerida:

Criterio de aceptación:

No utilices frases vagas como:

"mejorar seguridad"
"optimizar código"
"mejorar rendimiento"

Explica exactamente QUÉ, DÓNDE, POR QUÉ y CÓMO.

---

# 29. MATRIZ DE RIESGO

Genera una matriz priorizada:

| ID | Hallazgo | Área | Severidad | Impacto | Probabilidad | Esfuerzo | Prioridad |

Ordena primero:

CRITICAL
HIGH
MEDIUM
LOW

Dentro de cada grupo prioriza por:

impacto + probabilidad + dependencia técnica.

---

# 30. IDENTIFICAR QUICK WINS

Genera:

QUICK_WINS

Hallazgos:

- alto beneficio;
- bajo riesgo;
- esfuerzo XS/S.

Deben poder mejorar rápidamente:

- seguridad;
- calidad;
- rendimiento;
- mantenibilidad;
- UX.

---

# 31. IDENTIFICAR BLOCKERS

Genera separadamente:

PRODUCTION_BLOCKERS

SECURITY_BLOCKERS

SCALABILITY_BLOCKERS

COMMERCIALIZATION_BLOCKERS

No mezcles estos cuatro conceptos.

---

# 32. DEUDA TÉCNICA

Construye:

TECHNICAL_DEBT_REGISTER

Para cada deuda:

- origen;
- impacto;
- riesgo de aplazarla;
- costo creciente esperado;
- dependencia;
- estrategia de eliminación.

Distingue entre:

deliberate debt
accidental debt
architectural debt
security debt
testing debt
documentation debt

---

# 33. PLAN DE REMEDIACIÓN

Después del diagnóstico crea un roadmap.

FASE 0 — Emergencias
Vulnerabilidades críticas y riesgo de pérdida de datos.

FASE 1 — Estabilización
Errores, integridad, reliability y seguridad fundamental.

FASE 2 — Hardening
Seguridad, permisos, validaciones y observabilidad.

FASE 3 — Calidad
Refactoring, testing y mantenibilidad.

FASE 4 — Rendimiento
Frontend, backend, DB y recursos.

FASE 5 — Escalabilidad
Arquitectura preparada para crecimiento.

FASE 6 — Productización
Operación profesional, documentación y soporte.

FASE 7 — Comercialización
Readiness para clientes reales.

Para cada fase especifica:

- objetivos;
- hallazgos involucrados;
- tareas;
- dependencias;
- riesgo;
- esfuerzo;
- criterio de salida.

---

# 34. NO PROPONER REESCRITURAS SIN JUSTIFICACIÓN

No recomiendes:

"reescribir todo"

salvo evidencia excepcional.

Prefiere:

- evolución incremental;
- refactors controlados;
- strangler pattern cuando corresponda;
- migraciones graduales;
- cambios reversibles.

Cada recomendación arquitectónica importante debe justificar:

BENEFIT
COST
RISK
ALTERNATIVES

---

# 35. INFORME EJECUTIVO

El informe final debe comenzar con una sección destinada a dirección o potenciales inversionistas/clientes técnicos.

Debe responder claramente:

1. ¿Qué tan saludable está actualmente el producto?
2. ¿Es seguro?
3. ¿Es estable?
4. ¿Es mantenible?
5. ¿Es escalable?
6. ¿Está preparado para producción?
7. ¿Está preparado para venderse?
8. ¿Cuáles son los cinco principales riesgos?
9. ¿Cuánto trabajo estructural queda pendiente?
10. ¿Cuál debería ser la estrategia de evolución?

No ocultes riesgos técnicos detrás de lenguaje ejecutivo.

---

# 36. SOFTWARE HEALTH SCORE

Genera una puntuación 0-100 para:

Architecture
Frontend
Backend
Database
Security
QA
Performance
Scalability
Reliability
Observability
DevOps
UI/UX
Maintainability
Documentation
Commercial Readiness

Después calcula:

OVERALL SOFTWARE HEALTH

No utilices un promedio matemático ciego.

Seguridad, integridad de datos y reliability deben poder penalizar fuertemente el resultado total.

Una vulnerabilidad crítica puede impedir clasificar el producto como production-ready aunque otras áreas tengan notas altas.

---

# 37. TOP 10

Genera:

TOP 10 RISKS

TOP 10 TECHNICAL IMPROVEMENTS

TOP 10 SECURITY ACTIONS

TOP 10 QUALITY ACTIONS

TOP 10 PRODUCTIZATION ACTIONS

Evita duplicaciones entre listas cuando sea posible.

---

# 38. VALIDACIONES PENDIENTES

Crea una sección específica:

VALIDATION_BACKLOG

Separada por:

STATIC
DYNAMIC
SECURITY
PERFORMANCE
LOAD
DATABASE
UX
ACCESSIBILITY
INFRASTRUCTURE
PRODUCTION

Para cada validación indica:

- qué comprobar;
- herramienta o método recomendado;
- resultado esperado;
- criterio de fallo;
- prioridad.

---

# 39. PREGUNTAS ABIERTAS

Si faltan datos para completar alguna evaluación, genera:

OPEN_QUESTIONS

No bloquees toda la auditoría por datos faltantes.

Realiza primero todo el análisis posible y después enumera únicamente las preguntas que realmente pueden cambiar una decisión técnica importante.

---

# 40. FORMATO DEL INFORME FINAL

Entrega el resultado en este orden:

1. Executive Summary
2. Overall Software Health
3. Commercial Readiness
4. Project Technical Map
5. Technology Stack
6. Architecture Assessment
7. Frontend Assessment
8. UI/UX Assessment
9. Backend Assessment
10. API Assessment
11. Database Assessment
12. Cybersecurity Assessment
13. Supply Chain Assessment
14. QA Assessment
15. Performance Assessment
16. Scalability Assessment
17. Reliability Assessment
18. Observability Assessment
19. DevSecOps Assessment
20. Infrastructure Assessment
21. Privacy Assessment
22. Documentation Assessment
23. Productization Assessment
24. Findings Register
25. Risk Matrix
26. Production Blockers
27. Security Blockers
28. Scalability Blockers
29. Commercialization Blockers
30. Technical Debt Register
31. Quick Wins
32. Top 10 Risks
33. Top 10 Technical Improvements
34. Top 10 Security Actions
35. Top 10 Quality Actions
36. Validation Backlog
37. Remediation Roadmap
38. Open Questions
39. Final Technical Verdict

---

# 41. FINAL TECHNICAL VERDICT

Termina obligatoriamente con una conclusión inequívoca:

CURRENT STATE:
[clasificación]

PRODUCTION READINESS:
[0-100]

COMMERCIAL READINESS:
[0-100]

SECURITY CONFIDENCE:
[0-100]

MAINTAINABILITY:
[0-100]

SCALABILITY CONFIDENCE:
[0-100]

TOP PRIORITY:
[acción]

BIGGEST TECHNICAL RISK:
[riesgo]

BIGGEST SECURITY RISK:
[riesgo]

BIGGEST BUSINESS RISK:
[riesgo]

RECOMMENDED NEXT STEP:
[acción concreta]

Y responde finalmente:

¿RECOMENDARÍAS VENDER O DESPLEGAR ESTA APLICACIÓN HOY?

YES
YES WITH CONDITIONS
NO

Explica brevemente por qué.

---

# 42. ACTITUD DE AUDITORÍA

Sé riguroso.

Sé escéptico.

Sé autocrítico.

Busca activamente evidencia que contradiga una impresión positiva inicial.

Una aplicación que funciona localmente no necesariamente es:

segura,
estable,
escalable,
mantenible,
operable,
ni comercializable.

Tu responsabilidad es descubrir esa diferencia.

Comienza ahora realizando únicamente reconocimiento e inspección segura del proyecto antes de emitir el informe final.