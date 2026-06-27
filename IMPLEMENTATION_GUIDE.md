# IMPLEMENTATION_GUIDE.md

## Guía Quirúrgica de Implementación — Base de Datos Postgres/Supabase para Colecciones JO

---

### 1. Objetivo

Transformar la gestión de colecciones JO desde archivos planos y Google Sheets a una base de datos relacional robusta en Postgres, con integración Supabase y soporte para imágenes, asegurando trazabilidad, calidad y escalabilidad.

---

### 2. Alcance

- Modelado relacional normalizado (colecciones, referencias, telas, insumos, consumos, fases, imágenes).
- Migración de datos desde Sheets/CSV/Excel.
- Integración de almacenamiento multimedia.
- Configuración de Supabase (auth, storage, RLS).
- Documentación y automatización de reglas de negocio.

---

### 3. Actores Técnicos

- **Agentes**:
  - `atelier-data`: análisis textil, reglas de negocio, auditoría de datos.
  - `db-architect`: modelado y generación de DDL Postgres/Supabase.
  - `supabase-integrator`: configuración Supabase, storage, auth, RLS.
  - `data-migration`: scripts ETL, limpieza y migración de datos.
- **Skills**:
  - `apparel-analyzer`: reglas y validación textil.
  - `find-skills`: búsqueda de skills adicionales (Postgres, Supabase, ETL, etc).

---

### 4. Requisitos Previos

- Acceso a archivos fuente (Google Sheets, CSV, Excel).
- Scripts de migración existentes (`migrar_datos.py`, etc).
- Entorno con Node.js, Python, y cuenta Supabase.
- Conocimientos básicos de SQL y arquitectura web.

---

### 5. Arquitectura Objetivo

- **Postgres** como base de datos central.
- **Supabase** para hosting, auth, storage y APIs.
- **Frontend React/Vite** conectado a Supabase.
- **Scripts ETL** para migración.
- **MCPs** para documentar reglas y modelo.

---

### 6. Pasos de Implementación

#### Fase 1: Definición del Modelo

- [ ] Analizar la descripción del proyecto y reglas de negocio.
- [ ] Identificar entidades clave y relaciones.
- [ ] Generar diagrama ER conceptual.
- [ ] Traducir a esquema físico Postgres (tablas, claves, constraints, enums).
- [ ] Documentar el modelo en un MCP (`db-architect.mcp`).

#### Fase 2: Preparación del Entorno

- [ ] Crear proyecto Supabase o instancia Postgres.
- [ ] Configurar credenciales y acceso seguro.
- [ ] Crear tablas iniciales con DDL.
- [ ] Configurar Supabase Storage para imágenes.
- [ ] Configurar Supabase Auth y RLS si aplica.

#### Fase 3: Preparación de Datos

- [ ] Catalogar archivos fuente.
- [ ] Mapear columnas actuales a nuevas tablas.
- [ ] Normalizar valores (SI/NO, tallas, códigos, estados).
- [ ] Limpiar duplicados y validar con `apparel-analyzer`.
- [ ] Documentar reglas de transformación en un MCP (`data-migration.mcp`).

#### Fase 4: Migración

- [ ] Desarrollar scripts ETL (Python/JS).
- [ ] Migrar catálogos y tablas maestras.
- [ ] Migrar colecciones, referencias, consumos, telas, insumos, fases.
- [ ] Verificar integridad referencial y registrar errores.

#### Fase 5: Integración de Multimedia

- [ ] Definir esquema de almacenamiento de imágenes.
- [ ] Configurar Supabase Storage o equivalente.
- [ ] Implementar carga de archivos y generación de URLs.
- [ ] Almacenar solo URLs en la base.
- [ ] Documentar flujo de imágenes en un instructivo (`INSTRUCTIVO_FOTOS.md`).

#### Fase 6: Validación y Pruebas

- [ ] Verificar consultas clave (por colección, referencia, materiales, fases, imágenes).
- [ ] Ejecutar pruebas de consistencia y reglas de negocio.
- [ ] Ajustar modelo según hallazgos.
- [ ] Documentar resultados y decisiones.

---

### 7. To Do Checklist

```md
- [ ] 1. Analizar y validar la descripción del proyecto y las reglas de negocio.
- [ ] 2. Definir entidades y relaciones del modelo de datos.
- [ ] 3. Generar diagrama ER y esquema físico Postgres.
- [ ] 4. Crear entorno de base de datos Postgres / Supabase.
- [ ] 5. Configurar Supabase Storage para imágenes.
- [ ] 6. Configurar Auth y políticas iniciales si usan Supabase.
- [ ] 7. Mapear columnas actuales desde Sheets/CSV a tablas nuevas.
- [ ] 8. Normalizar valores y catálogos.
- [ ] 9. Crear tablas maestras / catálogos.
- [ ] 10. Desarrollar scripts ETL de migración.
- [ ] 11. Migrar datos de colecciones y referencias.
- [ ] 12. Migrar consumos, telas, insumos y fases.
- [ ] 13. Verificar integridad referencial y calidad de datos.
- [ ] 14. Integrar almacenamiento de fotos y enlaces.
- [ ] 15. Probar consultas principales y casos de uso.
- [ ] 16. Documentar el modelo y el proceso de migración.
- [ ] 17. Crear MCPs para: dominio textil, modelo DB, integración Supabase, migración.
- [ ] 18. Configurar agentes y skills para automatizar análisis y diseño.
```

---

### 8. Recomendaciones para IA ejecutora

- Lee primero `descripcion proyecto.md` y `informe_analisis_bd.md`.
- Usa `atelier-data` y `apparel-analyzer` para auditar y validar el dominio textil.
- Genera el diagrama ER y DDL en Postgres.
- Aplica scripts ETL y reporta filas rechazadas.
- Documenta cada paso en este archivo y en los MCPs correspondientes.

---

### 9. Notas Finales

- Cada fase debe completarse y validarse antes de avanzar.
- El modelo debe soportar integridad, migración confiable, consultas rápidas y administración de multimedia.
- Documenta todo para facilitar futuras integraciones y mantenimientos.

---
