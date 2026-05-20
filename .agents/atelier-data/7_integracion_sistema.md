# Pilar 7: Integración con el Sistema (System Integration)

Este documento define cómo **AtelierData** se conecta y colabora con los demás componentes del ecosistema del proyecto, incluyendo la aplicación web ProjectJO, el sistema de aprendizaje .antigravity, y la infraestructura de archivos.

---

## 1. Visión General del Ecosistema

```
┌─────────────────────────────────────────────────────────┐
│                    ECOSISTEMA JO                         │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │  AtelierData  │  │  ProjectJO   │  │  .antigravity │ │
│  │  (Análisis)   │  │  (Web App)   │  │  (Aprendizaje)│ │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘ │
│         │                 │                   │          │
│         └────────┬────────┴──────────┬────────┘          │
│                  │                   │                    │
│          ┌───────┴───────┐   ┌──────┴──────┐            │
│          │  Datos (CSV,  │   │  Reportes   │            │
│          │  Excel, JSON) │   │  (MD, PNG)  │            │
│          └───────────────┘   └─────────────┘            │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Conexión con ProjectJO (Aplicación Web React)

### 2.1 Rol de AtelierData en ProjectJO

AtelierData actúa como el **motor analítico backend** que alimenta de insights a la aplicación web. Mientras ProjectJO maneja la interfaz de usuario y el CRUD de referencias, AtelierData proporciona:

- **Validación de datos al importar**: Antes de que un CSV/Excel se cargue en ProjectJO, AtelierData audita su calidad.
- **Métricas para dashboards**: Cálculos de eficiencia textil, curvas de tallas y carga de trabajo.
- **Alertas proactivas**: Detección de cuellos de botella y violaciones de reglas de negocio.

### 2.2 Stack Tecnológico de ProjectJO

| Componente | Tecnología | Relevancia para AtelierData |
|------------|-----------|----------------------------|
| Frontend | React 19 + Vite | AtelierData puede sugerir formatos JSON para consumo del frontend |
| Routing | React Router DOM v7 | Navegación entre dashboards de análisis |
| Estado | Context API | Las alertas pueden integrarse al estado global |
| Estilos | Vanilla CSS + Glassmorphism | Diseño consistente con reportes |
| Build | Vite (ESM) | Los scripts de Python son independientes del bundle JS |

### 2.3 Estructura de Archivos del Proyecto

```
version 2.0/
├── src/                          # Código fuente React (ProjectJO)
│   ├── components/
│   ├── pages/
│   ├── data/
│   └── utils/
├── data/                         # Archivos de datos de colecciones
│   ├── PROTOTIPO V.01.xlsx       # Matriz maestra
│   └── *.csv                     # Exportaciones/validaciones
├── dist/                         # Reportes generados (Markdown, PNG)
├── scratch/                      # Scripts temporales de análisis
├── plans/                        # Documentos de planificación
├── .agents/
│   └── atelier-data/            # ★ Este agente
│       ├── README.md
│       ├── 1_identidad_rol.md
│       ├── 2_caja_herramientas.md
│       ├── 3_contexto_negocio.md
│       ├── 4_metodologia_trabajo.md
│       ├── 5_reglas_validacion.md
│       ├── 6_patrones_codigo.md
│       ├── 7_integracion_sistema.md
│       ├── 8_gestion_sesiones.md
│       └── scripts/
│           ├── auditoria_calidad.py
│           ├── segmentacion_tallas.py
│           ├── eficiencia_textil.py
│           └── reporte_premium.py
├── .antigravity/                 # Sistema de aprendizaje
├── .config/opencode/
│   └── opencode.json             # Configuración del agente
└── skills-lock.json
```

### 2.4 API de Datos entre Componentes

AtelierData puede generar datos en formatos consumibles por ProjectJO:

```json
{
  "analisis": {
    "fecha": "2026-05-20",
    "coleccion": "WS27",
    "score_salud": 92,
    "resumen": {
      "total_referencias": 48,
      "total_unidades": 12500
    },
    "curva_tallas": {
      "numerico": {"0": 500, "2": 1200, "4": 1800, "6": 2200, "8": 2800, "10": 2200, "12": 1800},
      "alfabetico": {"XS": 500, "S": 1200, "M": 1800, "L": 2200, "XL": 1500}
    },
    "eficiencia": {
      "ahorro_promedio_pct": 8.5,
      "ahorro_total_m": 234.5
    },
    "alertas": [
      {"severidad": "critica", "regla": "R09", "mensaje": "3 referencias con doble asignación DT/DU"},
      {"severidad": "alta", "regla": "R02", "mensaje": "2 referencias APROBADAS sin PT"}
    ]
  }
}
```

---

## 3. Conexión con .antigravity (Sistema de Aprendizaje)

### 3.1 Sinergia entre Agentes

| AtelierData provee | .antigravity consume |
|-------------------|---------------------|
| Datos reales de colecciones | Casos de estudio para análisis de arquitectura |
| Reportes de calidad | Métricas de progreso en debugging |
| Patrones de error detectados | Material para modo entrevistador |
| Insights de negocio | Contexto de dominio para el Learning Architect |

### 3.2 Perfiles de Usuario

- **Usuario Técnico (ProjectJO + AtelierData)**: Gestiona colecciones, ejecuta análisis, recibe alertas.
- **Usuario en Aprendizaje (.antigravity)**: Desarrolla habilidades de frontend usando ProjectJO como caso real.

AtelierData debe ser consciente de a qué perfil le está respondiendo para ajustar el nivel de detalle técnico.

---

## 4. Integración con Archivos de Datos

### 4.1 Formatos Soportados

| Formato | Extensión | Librería | Notas |
|---------|-----------|----------|-------|
| Excel | `.xlsx`, `.xls` | `openpyxl`, `pandas` | Soporta múltiples hojas, formatos, fórmulas |
| CSV | `.csv` | `pandas` | Requiere detección de encoding y delimitador |
| JSON | `.json` | `json` (stdlib) | Usado para casos de uso y configuraciones |
| Parquet | `.parquet` | `pandas` | Opcional para grandes volúmenes |
| DuckDB | `.db`, `.duckdb` | `duckdb` | Base de datos local para consultas rápidas |

### 4.2 Flujo de Archivos

```
[Google Sheets] → [Exportación CSV/Excel] → [/data/]
                                                      → [AtelierData analiza]
[PROTOTIPO V.01.xlsx] ← [Modificaciones controladas] ← [Usuario aprueba]

[/dist/] → [Reportes Markdown, PNG, JSON] → [Usuario revisa / ProjectJO consume]
```

### 4.3 Codificación y Delimitadores

| Archivo | Encoding esperado | Delimitador |
|---------|-------------------|-------------|
| PROTOTIPO V.01.xlsx | UTF-8 (nativo Excel) | N/A |
| CSV de Google Sheets | UTF-8 | `,` (coma) |
| CSV de SAP | UTF-8 o Latin-1 | `;` (punto y coma) o `\t` (tab) |

> Al cargar un CSV, intentar UTF-8 primero. Si falla, probar Latin-1 y detectar delimitador automáticamente.

---

## 5. Despliegue y Entorno

### 5.1 Dependencias Python Requeridas

```
pandas>=2.0.0
numpy>=1.24.0
duckdb>=0.9.0
openpyxl>=3.1.0
matplotlib>=3.7.0
seaborn>=0.12.0
xlsxwriter>=3.1.0
rapidfuzz>=3.0.0
```

### 5.2 Variables de Entorno Relevantes

```bash
ATELIER_DATA_DIR=/data          # Directorio de archivos de colección
ATELIER_OUTPUT_DIR=/dist        # Directorio de reportes
ATELIER_SCRATCH_DIR=/scratch    # Directorio de scripts temporales
ATELIER_LOG_LEVEL=INFO          # Nivel de logging
```

### 5.3 Modo de Operación sin Conexión

AtelierData funciona 100% offline. No requiere APIs externas ni conexión a internet para sus análisis principales. Las dependencias son solo librerías Python locales.
