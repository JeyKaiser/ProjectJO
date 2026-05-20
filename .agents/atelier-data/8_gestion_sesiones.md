# Pilar 8: Gestión de Sesiones y Memoria (Session Management)

Este documento define el sistema de memoria, tracking de análisis y aprendizaje continuo de **AtelierData** para mantener contexto entre sesiones y mejorar progresivamente la calidad de sus análisis.

---

## 1. Sistema de Memoria por Sesión

### 1.1 Archivo de Estado de Sesión

Cada sesión de análisis se registra en `/dist/.atelier_sessions.json`:

```json
{
  "version": "2.0",
  "ultima_sesion": "2026-05-20T14:30:00",
  "total_sesiones": 12,
  "colecciones_analizadas": ["WS27", "SS26", "FW26"],
  "sesiones": [
    {
      "id": "session_20260520_143000",
      "fecha": "2026-05-20T14:30:00",
      "archivo_analizado": "PROTOTIPO V.01.xlsx",
      "tipo_analisis": "auditoria_completa",
      "fases_ejecutadas": ["FASE_1", "FASE_2", "FASE_3", "FASE_4"],
      "score_salud": 88,
      "violaciones_criticas": 2,
      "violaciones_altas": 5,
      "referencias_problematicas": ["02815", "02822"],
      "hallazgos_clave": [
        "3 referencias con doble asignación DT/DU",
        "Ahorro textil promedio de 8.5% en línea Vestidos"
      ],
      "reporte_generado": "dist/reporte_premium_20260520_1430.md",
      "duracion_segundos": 45
    }
  ],
  "patrones_aprendidos": {
    "errores_comunes": [
      {"patron": "DT y DU ambos asignados", "frecuencia": 5, "ultima_vez": "2026-05-20"},
      {"patron": "TOTAL no coincide con suma de tallas", "frecuencia": 8, "ultima_vez": "2026-05-18"}
    ],
    "referencias_recurrentes": ["02801", "02815"],
    "disenadores_con_alta_carga": ["Elena Rojas", "Juan Pérez"]
  }
}
```

### 1.2 Ciclo de Vida de una Sesión

```
[Inicio] → [Registro de sesión] → [Carga de archivo] → [Fases 1-4]
→ [Actualización de estado] → [Registro de hallazgos] → [Cierre de sesión]
```

Al iniciar una nueva sesión, AtelierData:
1. Carga el archivo de estado de sesiones previas.
2. Identifica si la colección ya fue analizada antes.
3. Si ya existe análisis previo, compara métricas y detecta cambios.
4. Al finalizar, actualiza el archivo de estado.

---

## 2. Memoria de Decisiones del Usuario

### 2.1 Registro de Preferencias

```json
{
  "preferencias_usuario": {
    "formato_reporte": "markdown",
    "incluir_graficos": true,
    "nivel_detalle": "ejecutivo",
    "alertas_minimas": "media",
    "idioma": "es",
    "directorio_datos": "data/",
    "archivo_matriz_default": "PROTOTIPO V.01.xlsx"
  }
}
```

### 2.2 Registro de Correcciones del Usuario

Cuando el usuario corrige un análisis o provee feedback:

```json
{
  "correcciones": [
    {
      "fecha": "2026-05-20",
      "analisis_id": "session_20260520_143000",
      "correccion": "La referencia 02815 sí tiene PT asignado, está en la columna D fila 15",
      "tipo": "falso_positivo",
      "regla_afectada": "R02",
      "accion_tomada": "Actualizar validación para considerar rango de filas"
    }
  ]
}
```

Esto permite que AtelierData:
- Reduzca falsos positivos en futuras auditorías.
- Ajuste el mapeo de columnas si el usuario indica la ubicación correcta.
- Aprenda excepciones a las reglas de negocio.

---

## 3. Aprendizaje de Patrones entre Colecciones

### 3.1 Detección de Tendencias

Comparando métricas entre sesiones de diferentes colecciones:

| Métrica | WS27 | SS26 | FW26 | Tendencia |
|---------|------|------|------|-----------|
| Score salud | 88 | 92 | 85 | ↓ Ligero deterioro |
| Ahorro textil % | 8.5 | 7.2 | 9.1 | ↑ Mejora |
| Tasa rechazo | 12% | 15% | 10% | ↓ Mejora |
| Carga modista crítica | 3 | 2 | 4 | ↑ Empeora |

AtelierData debe alertar sobre tendencias negativas entre colecciones.

### 3.2 Referencias Recurrentes

Si una misma referencia aparece en múltiples colecciones (como referente o como reedición), AtelierData:
- Compara consumos entre colecciones para detectar desviaciones.
- Sugiere usar el consumo histórico como referencia para nuevas iteraciones.
- Alerta si el consumo aumentó significativamente sin justificación (cambio de tela, diseño).

### 3.3 Patrones de Error por Diseñador/Modista

Acumulando datos entre sesiones:

```python
def analizar_historico_errores(sessions_file):
    """Identifica diseñadores/modistas con patrones de error recurrentes."""
    with open(sessions_file) as f:
        data = json.load(f)

    errores_por_disenador = {}
    for session in data['sesiones']:
        for hallazgo in session.get('hallazgos_clave', []):
            # Extraer diseñador del hallazgo si es posible
            pass

    return errores_por_disenador
```

---

## 4. Sistema de Archivo y Rotación

### 4.1 Estructura de Archivos de Sesión

```
dist/
├── .atelier_sessions.json       # Estado maestro de sesiones
├── .atelier_preferencias.json   # Preferencias del usuario
├── .atelier_correcciones.json   # Historial de correcciones
├── reporte_premium_*.md         # Reportes individuales
├── bitacora_modificaciones.md   # Registro de cambios en Excel
└── graficos/                    # PNG generados
```

### 4.2 Rotación de Sesiones

- Mantener máximo 50 sesiones en el archivo de estado.
- Las sesiones más antiguas se archivan en `/dist/.atelier_archive/`.
- Los patrones aprendidos se consolidan y no se pierden al rotar.

---

## 5. Protocolo de Análisis Comparativo

Cuando se solicita comparar dos versiones de una misma colección:

```
1. Cargar ambos archivos (versión anterior y versión actual)
2. Ejecutar Fase 1 (auditoría) en ambas versiones por separado
3. Comparar scores de salud
4. Identificar:
   a. Referencias nuevas (no estaban en la versión anterior)
   b. Referencias eliminadas (estaban y ya no están)
   c. Referencias modificadas (cambios en status, consumos, tallas, asignaciones)
5. Generar reporte de diferencias con:
   - Resumen de cambios
   - Alertas sobre modificaciones que introdujeron nuevas violaciones
   - Alertas sobre violaciones que fueron corregidas
```

---

## 6. Integridad y Privacidad de la Memoria

- Los archivos de sesión (`.atelier_*`) **nunca** se comparten fuera del entorno local.
- No contienen datos crudos de las colecciones, solo métricas agregadas y referencias a archivos.
- Los nombres de diseñadores, modistas y proveedores se almacenan solo como referencia para patrones; no se exportan.
- El usuario puede solicitar `restablecer memoria` para limpiar todos los archivos de sesión.
