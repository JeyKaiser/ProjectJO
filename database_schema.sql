-- ===========================================================================
-- AtelierData v2.0 — Schema PostgreSQL para Gestión de Colecciones JO
-- Corregido y completado desde informe_ejecutivo de análisis
-- ===========================================================================
-- Correcciones aplicadas:
--   ✓ reference_codes estaba triplicada → unificada en una sola definicion
--   ✓ Orden FK corregido (referencias se crea antes que sus dependientes)
--   ✓ Agregadas tablas criticas faltantes: consumos, contramuestras,
--     notas_fabricacion, molderia, laboratorios, entregables
--   ✓ reference_fabrics limpia de campos duplicados del maestro fabrics
--   ✓ Campos nuevos en references: drops, time_collection, maquila, liberaciones
-- ===========================================================================

CREATE SCHEMA IF NOT EXISTS jo;
SET search_path = jo, public;

-- ===========================================================================
-- 1. ENUMS (tipos de dato personalizados)
-- ===========================================================================

CREATE TYPE jo.reference_status AS ENUM (
    'EN_PROCESO','APROBADO','CANCELADO','PAQUETE_COMPLETO','RECHAZADO','PENDIENTE'
);
CREATE TYPE jo.workshop_status AS ENUM (
    'PENDIENTE','EN_CORTE','EN_CONFECCION','TERMINADO','EN_REVISION'
);
CREATE TYPE jo.reference_code_type AS ENUM ('MD','PT');
CREATE TYPE jo.reference_role_type AS ENUM (
    'CREATIVO','TECNICO','TRAZADOR','MODISTA','SUPERVISOR','CONTROL_CALIDAD','INGENIERIA'
);
CREATE TYPE jo.consumo_role_type AS ENUM (
    'CREATIVO','TECNICO','TRAZADOR','CONTRAMUESTRA'
);
CREATE TYPE jo.consumo_tipo_tela AS ENUM (
    'SOLIDO','MOD_ARTE','UBI_TRAZO'
);
CREATE TYPE jo.external_process_type AS ENUM (
    'BORDADO','LAVANDERIA','TERMINACION','CORTE_EXTERNO','OTRO'
);
CREATE TYPE jo.difficulty_level AS ENUM ('BAJA','MEDIA','ALTA');
CREATE TYPE jo.size_group_type AS ENUM ('NUMERIC','ALPHABETIC','MIXTO');
CREATE TYPE jo.care_type AS ENUM ('LAVADO','SECADO','PLANCHADO','DESMANCHE','OTRO');
CREATE TYPE jo.image_entity_type AS ENUM (
    'REFERENCIA','TELA','INSUMO','CONTRAMUESTRA','OTRO'
);
CREATE TYPE jo.variant_type AS ENUM ('COLOR','TELA','MOLDERIA');
CREATE TYPE jo.closure_type AS ENUM ('CREMALLERA','BOTON','SNAP','OTRO');
CREATE TYPE jo.include_type AS ENUM ('PRINCIPAL','ACCESORIO','PAQUETE_COMPLETO','OTRO');
CREATE TYPE jo.bordado_type AS ENUM ('EN_PRENDA','SEMIELABORADO','OTRO');
CREATE TYPE jo.semi_elaborado_type AS ENUM ('BORDADO','ACCESORIO','OTRO');
CREATE TYPE jo.reference_type AS ENUM ('SILUETA','BASICA','SPECIAL','OTRO');
CREATE TYPE jo.tejido_type AS ENUM ('PLANO','PUNTO','CUERO','DENIM','OTRO');
CREATE TYPE jo.entrega_drop AS ENUM (
    'A','B','C','D','E','F','G','H','I','J','K','L','M',
    'N','O','P','Q','R','S','T','U','V','W','X','Y','Z'
);
CREATE TYPE jo.veredicto_medicion AS ENUM (
    'APROBADA_DIRECTA','APROBADA_COMENTARIOS','RECHAZADA'
);
CREATE TYPE jo.tipo_corte AS ENUM (
    'PRENDA_COMPLETA','LABORATORIO','PIEZA','REPOSICION'
);
CREATE TYPE jo.nota_fabricacion_status AS ENUM (
    'ACTIVA','UTILIZADA','ANULADA'
);

-- ===========================================================================
-- 2. TABLAS CATALOGO (dropdowns, sin dependencias o dependencias minimas)
-- ===========================================================================

CREATE TABLE jo.collections (
    id          SERIAL PRIMARY KEY,
    code        TEXT UNIQUE NOT NULL,
    name        TEXT NOT NULL,
    season      TEXT,
    year        INTEGER,
    capsule     TEXT,
    description TEXT,
    active      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE jo.lines (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    description TEXT,
    active      BOOLEAN DEFAULT TRUE
);

CREATE TABLE jo.sublines (
    id          SERIAL PRIMARY KEY,
    line_id     INTEGER NOT NULL REFERENCES jo.lines(id),
    name        TEXT NOT NULL,
    description TEXT,
    active      BOOLEAN DEFAULT TRUE,
    UNIQUE (line_id, name)
);

CREATE TABLE jo.tallaje_groups (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    type        jo.size_group_type NOT NULL,
    description TEXT
);

CREATE TABLE jo.person_roles (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE jo.reference_statuses (
    id          SERIAL PRIMARY KEY,
    status      jo.reference_status NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE jo.workshop_statuses (
    id          SERIAL PRIMARY KEY,
    status      jo.workshop_status NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE jo.closure_types (
    id          SERIAL PRIMARY KEY,
    type        jo.closure_type NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE jo.include_types (
    id          SERIAL PRIMARY KEY,
    type        jo.include_type NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE jo.fabric_base_types (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE jo.empaques (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE jo.care_types (
    id          SERIAL PRIMARY KEY,
    type        jo.care_type NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE jo.difficulty_levels (
    id          SERIAL PRIMARY KEY,
    level       jo.difficulty_level NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE jo.process_types (
    id          SERIAL PRIMARY KEY,
    type        jo.external_process_type NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE jo.variant_types (
    id          SERIAL PRIMARY KEY,
    type        jo.variant_type NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE jo.tejido_types (
    id          SERIAL PRIMARY KEY,
    type        jo.tejido_type NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE jo.corte_types (
    id          SERIAL PRIMARY KEY,
    type        jo.tipo_corte NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE jo.nota_fabricacion_statuses (
    id          SERIAL PRIMARY KEY,
    status      jo.nota_fabricacion_status NOT NULL UNIQUE,
    description TEXT
);

-- ===========================================================================
-- 3. TABLAS MAESTRAS (personas, telas, insumos)
-- ===========================================================================

CREATE TABLE jo.persons (
    id          SERIAL PRIMARY KEY,
    first_name  TEXT NOT NULL,
    last_name   TEXT NOT NULL,
    email       TEXT UNIQUE,
    phone       TEXT,
    cedula      TEXT,
    active      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE jo.user_accounts (
    id           SERIAL PRIMARY KEY,
    person_id    INTEGER REFERENCES jo.persons(id),
    email        TEXT UNIQUE NOT NULL,
    display_name TEXT,
    role         TEXT,
    active       BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE jo.fabrics (
    id                  SERIAL PRIMARY KEY,
    code                TEXT NOT NULL UNIQUE,
    description         TEXT NOT NULL,
    width_cm            NUMERIC(7,2),
    fabric_base_type_id INTEGER REFERENCES jo.fabric_base_types(id),
    supplier            TEXT,
    image_url           TEXT,
    active              BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE jo.supplies (
    id              SERIAL PRIMARY KEY,
    code            TEXT NOT NULL UNIQUE,
    description     TEXT NOT NULL,
    category        TEXT,
    unit_of_measure TEXT,
    supplier        TEXT,
    active          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================================
-- 4. TABLA CORE: REFERENCIAS
-- ===========================================================================

CREATE TABLE jo.references (
    id                      SERIAL PRIMARY KEY,
    collection_id           INTEGER REFERENCES jo.collections(id) ON DELETE SET NULL,
    line_id                 INTEGER REFERENCES jo.lines(id),
    subline_id              INTEGER REFERENCES jo.sublines(id),
    reference_number        TEXT NOT NULL,
    reference_type          jo.reference_type,
    name                    TEXT NOT NULL,
    color                   TEXT,
    color_code              TEXT,
    status_id               INTEGER REFERENCES jo.reference_statuses(id),
    workshop_status_id      INTEGER REFERENCES jo.workshop_statuses(id),
    tallaje_group_id        INTEGER REFERENCES jo.tallaje_groups(id),
    length_description      TEXT,
    closure_type_id         INTEGER REFERENCES jo.closure_types(id),
    package_type_id         INTEGER REFERENCES jo.empaques(id),
    include_type_id         INTEGER REFERENCES jo.include_types(id),
    main_image_url          TEXT,
    -- Catalogacion de la prenda (columnas AD, AE, AF del Excel original)
    has_art_modification    BOOLEAN DEFAULT FALSE,
    has_trace_location      BOOLEAN DEFAULT FALSE,
    has_all_over            BOOLEAN DEFAULT FALSE,
    -- Indicadores de procesos especiales
    has_embroidery          BOOLEAN DEFAULT FALSE,
    has_semielaborated      BOOLEAN DEFAULT FALSE,
    is_referenced           BOOLEAN DEFAULT FALSE,
    is_variant              BOOLEAN DEFAULT FALSE,
    -- Time Collection (columnas BE-BS)
    especificacion_confeccion TEXT,
    escalado_molderia_notes   TEXT,
    tiras_continuas           TEXT,
    dificultad_prenda_id      INTEGER REFERENCES jo.difficulty_levels(id),
    dificultad_bordado_id     INTEGER REFERENCES jo.difficulty_levels(id),
    sugerencia_mod_ubc        TEXT,
    requiere_muestra          BOOLEAN DEFAULT FALSE,
    grupo_estilo              TEXT,
    -- Prioridades
    priority_first_buy        INTEGER,
    priority_embroidery       INTEGER,
    priority_textile_stock    INTEGER,
    -- Drops y entregas
    drop_entrega           jo.entrega_drop,
    fecha_entrega_parcial  DATE,
    -- Notas por area
    header_notes           TEXT,
    engineering_notes      TEXT,
    trace_notes            TEXT,
    costing_notes          TEXT,
    -- Maquila (columnas DL-DP)
    tejido_type_id         INTEGER REFERENCES jo.tejido_types(id),
    complejidad_corte_id   INTEGER REFERENCES jo.difficulty_levels(id),
    envio_corte_maquila    BOOLEAN DEFAULT FALSE,
    complejidad_confeccion_id INTEGER REFERENCES jo.difficulty_levels(id),
    envio_confeccion_maquila  BOOLEAN DEFAULT FALSE,
    -- Liberaciones (columnas FX, FY)
    fecha_liberacion_diseno_ing     DATE,
    fecha_liberacion_ing_produccion DATE,
    -- Auditoria
    is_hidden              BOOLEAN DEFAULT FALSE,
    created_at             TIMESTAMPTZ DEFAULT NOW(),
    updated_at             TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (collection_id, reference_number)
);

-- ===========================================================================
-- 5. CODIGOS DE REFERENCIA (MD / PT) — UNICA definicion, corregida
-- ===========================================================================

CREATE TABLE jo.reference_codes (
    id              SERIAL PRIMARY KEY,
    reference_id    INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    code_type       jo.reference_code_type NOT NULL,
    code            TEXT NOT NULL,
    assigned_at     TIMESTAMPTZ DEFAULT NOW(),
    active          BOOLEAN DEFAULT TRUE,
    UNIQUE (reference_id, code_type),
    UNIQUE (code_type, code)
);

-- ===========================================================================
-- 6. VARIANTES Y REFERENTES
-- ===========================================================================

CREATE TABLE jo.references_variants (
    id               SERIAL PRIMARY KEY,
    reference_id     INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    variant_type_id  INTEGER NOT NULL REFERENCES jo.variant_types(id),
    color            TEXT,
    color_code       TEXT,
    fabric_id        INTEGER REFERENCES jo.fabrics(id),
    notes            TEXT,
    UNIQUE (reference_id, variant_type_id)
);

CREATE TABLE jo.references_referents (
    id                     SERIAL PRIMARY KEY,
    reference_id           INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    referent_reference_id  INTEGER NOT NULL REFERENCES jo.references(id),
    relationship           TEXT,
    notes                  TEXT,
    UNIQUE (reference_id, referent_reference_id)
);

-- ===========================================================================
-- 7. TELAS E INSUMOS POR REFERENCIA (relacion N:M limpia)
--    Campos duplicados del maestro fabrics fueron eliminados.
--    referencia → usage, width_cm y consumo_base son propios del contexto.
-- ===========================================================================

CREATE TABLE jo.reference_fabrics (
    id              SERIAL PRIMARY KEY,
    reference_id    INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    fabric_id       INTEGER NOT NULL REFERENCES jo.fabrics(id),
    usage           TEXT,
    width_cm        NUMERIC(7,2),
    consumo_base    NUMERIC(10,4),
    notes           TEXT,
    active          BOOLEAN DEFAULT TRUE
);

CREATE TABLE jo.reference_supplies (
    id              SERIAL PRIMARY KEY,
    reference_id    INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    supply_id       INTEGER NOT NULL REFERENCES jo.supplies(id),
    quantity        NUMERIC(10,4),
    unit_of_measure TEXT,
    notes           TEXT
);

CREATE TABLE jo.reference_includes (
    id              SERIAL PRIMARY KEY,
    reference_id    INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    include_type_id INTEGER REFERENCES jo.include_types(id),
    description     TEXT,
    notes           TEXT
);

-- ===========================================================================
-- 8. *** NUEVO: CONSUMOS VERSIONADOS (CRITICO) ***
--    Trazabilidad completa: Creativo → Técnico → Trazador → Contramuestra
--    Cada rol puede tener multiples versiones. Un solo registro es_final=TRUE
--    por referencia+tela+rol+tipo_tela.
-- ===========================================================================

CREATE TABLE jo.consumos (
    id                   SERIAL PRIMARY KEY,
    reference_id         INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    reference_fabric_id  INTEGER REFERENCES jo.reference_fabrics(id) ON DELETE CASCADE,
    role                 jo.consumo_role_type NOT NULL,
    tipo_tela            jo.consumo_tipo_tela,
    version              INTEGER NOT NULL DEFAULT 1,
    talla                TEXT,
    unidades             INTEGER,
    consumo_valor        NUMERIC(10,4),
    observaciones        TEXT,
    disenador_id         INTEGER REFERENCES jo.persons(id),
    cambio_molderia      BOOLEAN,
    es_final             BOOLEAN DEFAULT FALSE,
    registrado_por       INTEGER REFERENCES jo.persons(id),
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (reference_id, reference_fabric_id, role, tipo_tela, version)
);

-- ===========================================================================
-- 9. *** NUEVO: NOTAS DE FABRICACION SAP ***
--    Reserva/asigna telas e insumos para una referencia antes de produccion.
--    Columnas GG, GH, GI, GJ del Excel original.
-- ===========================================================================

CREATE TABLE jo.notas_fabricacion (
    id                   SERIAL PRIMARY KEY,
    reference_id         INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    codigo_nota          TEXT UNIQUE,
    fecha_creacion       DATE,
    status_id            INTEGER REFERENCES jo.nota_fabricacion_statuses(id),
    fecha_traslado_sap   DATE,
    fecha_despacho_zf    DATE,
    observaciones        TEXT,
    created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================================
-- 10. *** NUEVO: CONTRAMUESTRAS ***
--     Cada contramuestra tiene un codigo OT, se relaciona con una nota de
--     fabricacion SAP y tiene su propio flujo de confeccion y fechas.
--     Columnas FZ-GJ del Excel original.
-- ===========================================================================

CREATE TABLE jo.contramuestras (
    id                          SERIAL PRIMARY KEY,
    reference_id                INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    nombre                      TEXT,
    codigo_ot                   TEXT NOT NULL UNIQUE,
    talla                       TEXT,
    descripcion_color           TEXT,
    unidades_cortadas           INTEGER,
    nota_fabricacion_id         INTEGER REFERENCES jo.notas_fabricacion(id),
    prioridad                   INTEGER CHECK (prioridad BETWEEN 1 AND 10),
    fecha_meta_entrega          DATE,
    drop_entrega                jo.entrega_drop,
    status                      TEXT,
    modista_id                  INTEGER REFERENCES jo.persons(id),
    fecha_inicio_confeccion     DATE,
    fecha_entrega_confeccion    DATE,
    estado_confeccion           TEXT,
    observaciones_confeccion    TEXT,
    tiempo_confeccion_minutos   INTEGER,
    estado_prenda_planta        TEXT,
    tipo_rechazo_planta         TEXT,
    feedback_planta             TEXT,
    reprogramada                BOOLEAN DEFAULT FALSE,
    fecha_reprogramacion        DATE,
    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================================
-- 11. *** NUEVO: MOLDERIA ***
--     Tracking del proceso de patronaje: fechas, disenador, hallazgos.
--     Columnas DV-DX del Excel original.
-- ===========================================================================

CREATE TABLE jo.molderia (
    id              SERIAL PRIMARY KEY,
    reference_id    INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    disenador_id    INTEGER REFERENCES jo.persons(id),
    fecha_inicio    DATE,
    fecha_fin       DATE,
    comentarios     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================================
-- 12. *** NUEVO: LABORATORIOS ***
--     Ensayos/pruebas de corte parcial antes de cortar la prenda completa.
--     Descrito en el glosario del proyecto.
-- ===========================================================================

CREATE TABLE jo.laboratorios (
    id              SERIAL PRIMARY KEY,
    reference_id    INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    fecha           DATE,
    descripcion     TEXT,
    resultado       TEXT,
    realizado_por   INTEGER REFERENCES jo.persons(id),
    observaciones   TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================================
-- 13. *** NUEVO: ENTREGABLES ***
--     Estados de entregables por area (creativo, tecnico, trazador, mod arte).
--     Columnas AS-AV del Excel original.
-- ===========================================================================

CREATE TABLE jo.entregables (
    id              SERIAL PRIMARY KEY,
    reference_id    INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    tipo            TEXT NOT NULL,
    completado      BOOLEAN DEFAULT FALSE,
    fecha_completado DATE,
    observaciones   TEXT,
    UNIQUE (reference_id, tipo)
);

-- ===========================================================================
-- 14. WORKFLOW: FASES, ASIGNACIONES E HISTORIAL
-- ===========================================================================

CREATE TABLE jo.workflow_phases (
    id          SERIAL PRIMARY KEY,
    code        TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL UNIQUE,
    description TEXT,
    sequence    INTEGER NOT NULL,
    macro_fase  INTEGER NOT NULL CHECK (macro_fase BETWEEN 1 AND 4)
);

CREATE TABLE jo.reference_assignments (
    id              SERIAL PRIMARY KEY,
    reference_id    INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    person_id       INTEGER NOT NULL REFERENCES jo.persons(id),
    role_id         INTEGER NOT NULL REFERENCES jo.person_roles(id),
    phase_id        INTEGER REFERENCES jo.workflow_phases(id),
    assigned_at     TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    notes           TEXT
);

CREATE TABLE jo.reference_phase_history (
    id              SERIAL PRIMARY KEY,
    reference_id    INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    phase_id        INTEGER NOT NULL REFERENCES jo.workflow_phases(id),
    person_id       INTEGER REFERENCES jo.persons(id),
    start_date      TIMESTAMPTZ,
    end_date        TIMESTAMPTZ,
    status          TEXT,
    notes           TEXT
);

-- ===========================================================================
-- 15. PROCESOS ESPECIALES: BORDADO, SEMIELABORADO, EXTERNOS
-- ===========================================================================

CREATE TABLE jo.reference_embroidery (
    id              SERIAL PRIMARY KEY,
    reference_id    INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    bordado_type    jo.bordado_type NOT NULL,
    description     TEXT,
    supplier        TEXT,
    cost            NUMERIC(14,2),
    status          TEXT,
    start_date      DATE,
    end_date        DATE,
    notes           TEXT
);

CREATE TABLE jo.reference_semielaborated (
    id                   SERIAL PRIMARY KEY,
    reference_id         INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    semi_elaborated_type jo.semi_elaborado_type NOT NULL,
    description          TEXT,
    supplier             TEXT,
    status               TEXT,
    start_date           DATE,
    end_date             DATE,
    notes                TEXT
);

CREATE TABLE jo.external_processes (
    id               SERIAL PRIMARY KEY,
    reference_id     INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    process_type_id  INTEGER REFERENCES jo.process_types(id),
    provider         TEXT,
    description      TEXT,
    cost             NUMERIC(14,2),
    received_at      DATE,
    delivered_at     DATE,
    status           TEXT,
    notes            TEXT
);

-- ===========================================================================
-- 16. PRODUCCION: UNIDADES, CALIDAD, FICHAS TECNICAS, MEDICIONES
-- ===========================================================================

CREATE TABLE jo.production_units (
    id              SERIAL PRIMARY KEY,
    reference_id    INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    size            TEXT NOT NULL,
    quantity        INTEGER DEFAULT 0,
    recorded_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE jo.quality_issues (
    id                     SERIAL PRIMARY KEY,
    reference_id           INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    detected_at            TIMESTAMPTZ DEFAULT NOW(),
    area                   TEXT,
    classification         TEXT,
    material               TEXT,
    material_classification TEXT,
    execution_type         TEXT,
    description            TEXT,
    corrective_action      TEXT,
    resolved               BOOLEAN DEFAULT FALSE
);

CREATE TABLE jo.tech_sheets (
    id                          SERIAL PRIMARY KEY,
    reference_id                INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    specialist_id               INTEGER REFERENCES jo.persons(id),
    started_at                  DATE,
    completed_at                DATE,
    material_review             BOOLEAN,
    embroidery_sheet_delivered  BOOLEAN,
    embroidery_sheet_date       DATE,
    liberacion_ficha_fisica     BOOLEAN DEFAULT FALSE,
    notes                       TEXT
);

CREATE TABLE jo.measures (
    id                   SERIAL PRIMARY KEY,
    reference_id         INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    phase                INTEGER NOT NULL CHECK (phase BETWEEN 1 AND 5),
    measure_date         DATE,
    veredicto            jo.veredicto_medicion,
    comments             TEXT,
    sample_photo_taken   BOOLEAN DEFAULT FALSE,
    delivered_to_tech_sheet DATE
);

-- ===========================================================================
-- 17. COMPOSICIONES, CUIDADOS Y MONTAJE
-- ===========================================================================

CREATE TABLE jo.compositions (
    id                   SERIAL PRIMARY KEY,
    reference_id         INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    scope                TEXT NOT NULL CHECK (scope IN ('MUESTRA','PRODUCCION')),
    sap_registered       BOOLEAN DEFAULT FALSE,
    description_usauk    TEXT,
    fiber_composition    TEXT,
    woven_knitted        TEXT,
    inside_composition   TEXT,
    include_description  TEXT,
    notes                TEXT
);

CREATE TABLE jo.care_instructions (
    id              SERIAL PRIMARY KEY,
    reference_id    INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    care_type_id    INTEGER REFERENCES jo.care_types(id),
    instruction     TEXT,
    icon_url        TEXT,
    notes           TEXT
);

CREATE TABLE jo.montage_mannequin (
    id                SERIAL PRIMARY KEY,
    reference_id      INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    montage_type      TEXT,
    description       TEXT,
    related_reference TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================================
-- 18. CORTES Y CONFECCIONES
-- ===========================================================================

CREATE TABLE jo.cuts (
    id               SERIAL PRIMARY KEY,
    reference_id     INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    cut_number       INTEGER CHECK (cut_number BETWEEN 1 AND 4),
    cut_date         DATE,
    cut_type_id      INTEGER REFERENCES jo.corte_types(id),
    units_piece      INTEGER,
    units_sample     INTEGER,
    observations     TEXT
);

CREATE TABLE jo.sewings (
    id                         SERIAL PRIMARY KEY,
    reference_id               INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    seamstress_id              INTEGER REFERENCES jo.persons(id),
    start_date                 DATE,
    end_date                   DATE,
    status                     TEXT,
    notes                      TEXT,
    engineering_time_minutes   INTEGER,
    plant_status               TEXT,
    plant_rejection_type       TEXT,
    plant_feedback             TEXT
);

-- ===========================================================================
-- 19. IMAGENES (tabla polimórfica unificada)
-- ===========================================================================

CREATE TABLE jo.reference_images (
    id           SERIAL PRIMARY KEY,
    entity_type  jo.image_entity_type NOT NULL,
    entity_id    INTEGER NOT NULL,
    url          TEXT NOT NULL,
    image_type   TEXT,
    uploaded_at  TIMESTAMPTZ DEFAULT NOW(),
    description  TEXT
);

-- ===========================================================================
-- 20. FEEDBACK Y REVISIONES DE PRODUCCION
-- ===========================================================================

CREATE TABLE jo.embroidery_reviews (
    id              SERIAL PRIMARY KEY,
    reference_id    INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    classification  TEXT,
    variables       TEXT,
    observations    TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE jo.production_feedback (
    id              SERIAL PRIMARY KEY,
    reference_id    INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    feedback_type   TEXT NOT NULL,
    classification  TEXT,
    variables       TEXT,
    observations    TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================================
-- 21. INDICES (consultas frecuentes)
-- ===========================================================================

CREATE INDEX idx_collections_active ON jo.collections(active);
CREATE INDEX idx_references_collection   ON jo.references(collection_id);
CREATE INDEX idx_references_line         ON jo.references(line_id);
CREATE INDEX idx_references_subline      ON jo.references(subline_id);
CREATE INDEX idx_references_status       ON jo.references(status_id);
CREATE INDEX idx_references_drop         ON jo.references(drop_entrega);
CREATE INDEX idx_references_created      ON jo.references(created_at);

CREATE INDEX idx_reference_codes_ref     ON jo.reference_codes(reference_id);
CREATE INDEX idx_reference_codes_type    ON jo.reference_codes(code_type);

CREATE INDEX idx_ref_fabrics_reference   ON jo.reference_fabrics(reference_id);
CREATE INDEX idx_ref_fabrics_fabric      ON jo.reference_fabrics(fabric_id);
CREATE INDEX idx_ref_supplies_reference  ON jo.reference_supplies(reference_id);
CREATE INDEX idx_ref_supplies_supply     ON jo.reference_supplies(supply_id);

CREATE INDEX idx_consumos_reference      ON jo.consumos(reference_id);
CREATE INDEX idx_consumos_fabric         ON jo.consumos(reference_fabric_id);
CREATE INDEX idx_consumos_role           ON jo.consumos(role);
CREATE INDEX idx_consumos_es_final       ON jo.consumos(es_final) WHERE es_final = TRUE;

CREATE INDEX idx_notas_fab_reference     ON jo.notas_fabricacion(reference_id);
CREATE INDEX idx_contramuestras_ref      ON jo.contramuestras(reference_id);
CREATE INDEX idx_contramuestras_nota     ON jo.contramuestras(nota_fabricacion_id);
CREATE INDEX idx_contramuestras_ot       ON jo.contramuestras(codigo_ot);

CREATE INDEX idx_molderia_reference      ON jo.molderia(reference_id);
CREATE INDEX idx_laboratorios_reference  ON jo.laboratorios(reference_id);
CREATE INDEX idx_entregables_reference   ON jo.entregables(reference_id);

CREATE INDEX idx_assignments_reference   ON jo.reference_assignments(reference_id);
CREATE INDEX idx_assignments_person      ON jo.reference_assignments(person_id);
CREATE INDEX idx_phase_history_reference ON jo.reference_phase_history(reference_id);
CREATE INDEX idx_phase_history_phase     ON jo.reference_phase_history(phase_id);

CREATE INDEX idx_external_processes_ref  ON jo.external_processes(reference_id);
CREATE INDEX idx_production_units_ref    ON jo.production_units(reference_id);
CREATE INDEX idx_quality_issues_ref      ON jo.quality_issues(reference_id);
CREATE INDEX idx_tech_sheets_ref         ON jo.tech_sheets(reference_id);
CREATE INDEX idx_measures_reference      ON jo.measures(reference_id);
CREATE INDEX idx_care_instructions_ref   ON jo.care_instructions(reference_id);
CREATE INDEX idx_compositions_ref        ON jo.compositions(reference_id);
CREATE INDEX idx_cuts_reference          ON jo.cuts(reference_id);
CREATE INDEX idx_sewings_reference       ON jo.sewings(reference_id);
CREATE INDEX idx_sewings_seamstress      ON jo.sewings(seamstress_id);
CREATE INDEX idx_reference_images_entity ON jo.reference_images(entity_type, entity_id);
CREATE INDEX idx_embroidery_reviews_ref  ON jo.embroidery_reviews(reference_id);
CREATE INDEX idx_production_feedback_ref ON jo.production_feedback(reference_id);
CREATE INDEX idx_production_feedback_type ON jo.production_feedback(feedback_type);

-- ===========================================================================
-- 22. TRIGGERS: actualizacion automatica de updated_at
-- ===========================================================================

CREATE OR REPLACE FUNCTION jo.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_collections_updated
    BEFORE UPDATE ON jo.collections
    FOR EACH ROW EXECUTE FUNCTION jo.update_timestamp();

CREATE TRIGGER trg_references_updated
    BEFORE UPDATE ON jo.references
    FOR EACH ROW EXECUTE FUNCTION jo.update_timestamp();

CREATE TRIGGER trg_persons_updated
    BEFORE UPDATE ON jo.persons
    FOR EACH ROW EXECUTE FUNCTION jo.update_timestamp();

CREATE TRIGGER trg_contramuestras_updated
    BEFORE UPDATE ON jo.contramuestras
    FOR EACH ROW EXECUTE FUNCTION jo.update_timestamp();

CREATE TRIGGER trg_molderia_updated
    BEFORE UPDATE ON jo.molderia
    FOR EACH ROW EXECUTE FUNCTION jo.update_timestamp();

-- ===========================================================================
-- 23. FUNCION: validar que solo un consumo es_final por referencia+tela+rol+tipo
-- ===========================================================================

CREATE OR REPLACE FUNCTION jo.validar_unico_es_final()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.es_final = TRUE THEN
        UPDATE jo.consumos
        SET es_final = FALSE
        WHERE reference_id = NEW.reference_id
          AND reference_fabric_id IS NOT DISTINCT FROM NEW.reference_fabric_id
          AND role = NEW.role
          AND tipo_tela IS NOT DISTINCT FROM NEW.tipo_tela
          AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_consumos_es_final
    BEFORE INSERT OR UPDATE ON jo.consumos
    FOR EACH ROW
    WHEN (NEW.es_final = TRUE)
    EXECUTE FUNCTION jo.validar_unico_es_final();

-- ===========================================================================
-- 24. COMENTARIOS DE DOCUMENTACION
-- ===========================================================================

COMMENT ON SCHEMA jo IS 'Schema para gestion de colecciones de moda JO (Johanna Ortiz)';

COMMENT ON TABLE jo.collections     IS 'Catalogo de colecciones (WINTER SUN, RESORT RTW, etc.)';
COMMENT ON TABLE jo.references      IS 'Tabla core: una fila por cada referencia/prenda';
COMMENT ON TABLE jo.reference_codes IS 'Codigos MD (muestra diseno) y PT (producto terminado)';
COMMENT ON TABLE jo.fabrics         IS 'Catalogo maestro de telas';
COMMENT ON TABLE jo.supplies        IS 'Catalogo maestro de insumos no textiles';
COMMENT ON TABLE jo.reference_fabrics IS 'Relacion N:M referencia-tela con datos contextuales';
COMMENT ON TABLE jo.consumos        IS 'Trazabilidad de consumos versionados por rol (creativo, tecnico, trazador, contramuestra)';
COMMENT ON TABLE jo.notas_fabricacion IS 'Notas de Fabricacion SAP que reservan telas/insumos';
COMMENT ON TABLE jo.contramuestras  IS 'Contramuestras con codigo OT y flujo de produccion';
COMMENT ON TABLE jo.molderia        IS 'Seguimiento del proceso de patronaje/molderia';
COMMENT ON TABLE jo.laboratorios    IS 'Ensayos de corte parcial antes de corte completo';
COMMENT ON TABLE jo.entregables     IS 'Estado de entregables por area (creativo, tecnico, trazador)';
COMMENT ON TABLE jo.reference_images IS 'Imagenes polimorficas para cualquier entidad del sistema';
COMMENT ON TABLE jo.reference_phase_history IS 'Historial de fases del workflow con fechas de entrada/salida';
COMMENT ON TABLE jo.reference_embroidery IS 'Procesos de bordado asociados a una referencia';
COMMENT ON TABLE jo.reference_semielaborated IS 'Piezas semielaboradas de una referencia';
COMMENT ON TABLE jo.measures          IS 'Mediciones en modelo/maniqui (5 fases)';
COMMENT ON TABLE jo.compositions      IS 'Composiciones de marquillas (muestra y produccion)';
COMMENT ON TABLE jo.production_units  IS 'Unidades de produccion por talla';
COMMENT ON TABLE jo.quality_issues    IS 'Hallazgos de calidad en validacion de materia prima';
COMMENT ON TABLE jo.production_feedback IS 'Feedback de produccion clasificado por area';
COMMENT ON TABLE jo.sewings           IS 'Registro de confecciones por modista';
COMMENT ON TABLE jo.cuts              IS 'Registro de cortes (hasta 4 por referencia)';
