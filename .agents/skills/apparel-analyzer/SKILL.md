---
name: apparel-analyzer
description: Skill personalizada para analizar, limpiar, estructurar y extraer métricas clave de archivos CSV/Excel de colecciones de ropa y producción textil. Implementa el workflow de 4 fases de AtelierData: Auditoría, Segmentación, Eficiencia Textil y Reportes Premium.
triggers:
  - keywords: ["analizar colección", "auditar matriz", "segmentar tallas", "eficiencia textil", "consumo tela", "reporte colección", "validar matriz", "perfilar datos", "estado colección", "cuello de botella", "rechazos planta", "curva tallas", "comparar colección", "PROTOTIPO", "matriz JO", "Matriz JO"]
  - file_patterns: ["*.csv", "*.xlsx", "*.xls"]
    content_keywords: ["Ref", "Código MD", "Código PT", "Status", "TOTAL", "Diseñador", "Consumo", "Trazador"]
---

# Analizador de Colecciones y Manufactura Textil (Apparel Analyzer)

Esta skill implementa el agente **AtelierData** para el análisis de datos de colecciones de moda y manufactura de prendas de vestir. Permite procesar matrices de referencias, parámetros de diseño, consumos de tela y datos de producción.

## Activación Automática

Esta skill se activa cuando:
- El usuario menciona explícitamente al agente **atelier-data** o **AtelierData**.
- El usuario usa palabras clave: `analizar colección`, `auditar matriz`, `segmentar tallas`, `eficiencia textil`, `consumo tela`, `reporte colección`, `validar matriz`, `perfilar datos`, `estado colección`.
- Se detecta un archivo CSV/Excel con columnas típicas de la matriz JO (`Ref`, `Código MD`, `Código PT`, `Status`, `TOTAL`, `Diseñador`, `Consumo`, `Trazador`).

## Flujo de Trabajo (4 Fases)

Todo análisis sigue rigurosamente el flujo de 4 fases definido en `4_metodologia_trabajo.md`:

```
FASE 1: Auditoría → FASE 2: Segmentación → FASE 3: Eficiencia Textil → FASE 4: Reporte Premium
```

### FASE 1: Auditoría y Calidad de Datos
1. Cargar archivo con detección automática de encabezados (header=1 para Excel, skiprows para CSV).
2. Normalizar tipos de dato: tallas a `int`, SI/NO a mayúsculas, catálogos a upper + strip.
3. Ejecutar validación de 4 capas (Pilar 5):
   - **C1 - Estructural**: tipos de dato, rangos, nulos.
   - **C2 - Referencial**: diseñadores/modistas contra catálogo PARAMETROS.
   - **C3 - Negocio**: 25 reglas R01-R25 (Pilar 3).
   - **C4 - Estadística**: outliers, patrones de error.
4. Calcular **score de salud** (0-100).
5. Si score < 50: detener y reportar. Sugerir limpieza antes de continuar.

### FASE 2: Segmentación y Agrupación
1. **Curva de Tallas**: Sumar unidades por talla (numérico: 0-12, alfabético: XS-XL), calcular porcentajes.
2. **Carga de Trabajo**: Agrupar por diseñador técnico y modista. Detectar sobrecarga (> 15 referencias por persona).
3. **Por Línea/Sublínea**: Total referencias, unidades, consumo promedio, tasa de aprobación.
4. **Por Estado**: Distribución de status, referencias estancadas, tiempo promedio por etapa.

### FASE 3: Eficiencia Textil
1. Calcular ahorro lineal = Consumo Diseñador - Consumo Trazador.
2. Calcular % de ahorro y proyectar ahorro total (ahorro × unidades TOTAL).
3. Analizar impacto de catálogos especiales (Mod Arte, Ubi Trazo, All Over) vs. sólidos.
4. Comparar contra consumo base histórico si está disponible.

### FASE 4: Reporte Premium
1. Resumen Ejecutivo con 3-5 hallazgos de mayor impacto.
2. Alertas estratégicas con formato GitHub:
   - `> [!IMPORTANT]` para críticas.
   - `> [!WARNING]` para altas.
   - `> [!TIP]` para oportunidades.
3. Tablas de datos ordenadas con separadores de miles.
4. Trazabilidad: archivo origen, rango de datos, fecha del análisis.

## Scripts Disponibles

Ejecutar directamente desde `.agents/atelier-data/scripts/`:

| Script | Fase | Uso |
|--------|------|-----|
| `auditoria_calidad.py` | FASE 1 | `python auditoria_calidad.py <archivo.csv/xlsx>` |
| `segmentacion_tallas.py` | FASE 2 | `python segmentacion_tallas.py <archivo.csv/xlsx>` |
| `eficiencia_textil.py` | FASE 3 | `python eficiencia_textil.py <archivo.csv/xlsx>` |
| `reporte_premium.py` | FASE 4 | `python reporte_premium.py <archivo.csv/xlsx>` |

## Estructura de Datos de Referencia

1. **Información Básica**: Ref (A), Código MD (C), Código PT (D), Nombre (E), Color (F).
2. **Segmentación**: Línea (P), Sublínea (Q), Tallaje (S), Largo (T).
3. **Consumos**: Diseño Creativo (1,2,3), Diseño Técnico (Sólido/Mod Arte/Ubi Trazo), Trazadores.
4. **Estados**: Status (K), Status Taller (M), Entregables (AS, AT, AU).
5. **Unidades**: Tallas 0-12 (CY-DE), XS-XL (DF-DJ), TOTAL (DK).
6. **Calidad**: Estado prenda planta (EV), Tipo de rechazo (EW), Tiempo confección (EU).
7. **Validación MP**: Fecha (BT), Área (BU), Clasificación (BV), Acción (BY).

## Reglas de Negocio Clave (Top 10)

| ID | Regla | Severidad |
|----|-------|-----------|
| R01 | PT no puede existir sin MD | CRÍTICA |
| R02 | APROBADO requiere Código PT | CRÍTICA |
| R07 | TOTAL = suma de todas las tallas | CRÍTICA |
| R09 | Contramuestra: DT o DU, nunca ambos | CRÍTICA |
| R04 | Entregable creativo OK → consumos > 0 | ALTA |
| R05 | Entregable técnico OK → consumos > 0 | ALTA |
| R06 | Entregable trazador OK → consumos > 0 | ALTA |
| R11 | Mod Arte SI → Envío MOD arte debe ser OK | ALTA |
| R15 | Consumos no pueden ser 0 en referencias activas | ALTA |
| R21 | Fin moldería no anterior a inicio | ALTA |

## Ejemplo de Salida

> [!NOTE]
> **Resumen de Colección: Winter Sun (WS27)**
> - **Total Referencias**: 48 prendas en desarrollo.
> - **Score de Salud**: 88/100.
> - **Estado Crítico**: 5 referencias marcadas como RECHAZADA por problemas de medidas.
> - **Oportunidad**: Optimización de trazo en Vestidos Maxidress ahorró 0.18 m/unidad = $4,500 USD proyectados.

| Línea | Sublínea | Ref | Status | Unidades | Ahorro Tela |
|-------|----------|-----|--------|----------|-------------|
| Vestidos | Maxidress | 02801 | Aprobado | 1,200 | 8.5% |
| Tops | Crop Top | 02802 | En Confección | 850 | 5.2% |

## Modos de Operación

- **Modo Auditor**: Solo Fase 1. Activar con: `audita`, `revisa calidad`, `valida datos`.
- **Modo Analista**: Fases 1-3. Activar con: `analiza`, `segmenta`, `eficiencia`.
- **Modo Reportero**: Fases 1-4. Activar con: `reporte completo`, `informe ejecutivo`.
- **Modo Comparador**: Compara dos archivos. Activar con: `compara`, `diferencia entre`.
- **Modo Escritor**: Modifica Excel. Activar con: `modifica celda`, `actualiza`, `corrige`.
