# AtelierData - Sistema de Validación de Telas

Sistema mejorado para la gestión de telas, consumos e insumos de colecciones de moda en Google Sheets + Apps Script.

## Arquitectura

```
google_sheets/
├── RESUMEN              ← Dashboard ejecutivo (KPIs, alertas)
├── REFERENCIAS          ← 1 fila por referencia (sin celdas combinadas)
├── TELAS_X_REFERENCIA   ← 1 fila por tela por referencia
├── CONSUMOS             ← Consumos unificados (CREATIVO + TECNICO + TRAZO)
├── CONSUMOS_CONTRAMUESTRA ← Consumos post-costeo para verificación
├── INSUMOS              ← Insumos no textiles (elásticos, cintas, etc.)
├── PARAMETROS           ← Catálogos maestros para dropdowns
├── HISTORIAL            ← Bitácora automática de cambios
├── ALERTAS              ← Registro de diferencias >5% costeo vs contramuestra
└── (Apps Script)        ← Automatizaciones, roles, validaciones, correos
```

## Mejoras vs Estructura Anterior

| Problema Actual | Solución Nueva |
|---|---|
| 66+ columnas, celdas combinadas (`rowspan`) | 8 hojas relacionales, 1 fila = 1 entidad |
| Versionado "a la derecha" (nueva columna por update) | `VERSION`: 1, 2, 3... en filas separadas, trazable |
| Filas grises = tela descontinuada (sin metadata) | `ACTIVO = FALSE` + motivo, fecha, reemplazo |
| Filas ocultas = referencias canceladas | `OCULTO = TRUE` (checkbox), filtrable |
| Imágenes embebidas (1.56GB) | URLs a Google Drive, `=IMAGE(url)` bajo demanda |
| `#N/A` por IMPORTRANGE rotas | Controlado con validación, menor dependencia |
| Sin control de acceso | Roles: CREATIVO, TECNICO, TRAZO, ADMIN, CONSULTA |
| Sin alertas automáticas | Comparación diaria, correo si >5% diferencia |
| Sin trazabilidad de cambios | `HISTORIAL` automático con `onEdit()` |

## Instalación (100% Google Sheets, sin Python local)

### Paso 1: Crear el nuevo Sheet

1. Ve a `sheets.google.com` → **+ En blanco**
2. Renómbralo: `AtelierData - Validacion Telas WS27`
3. Copia el ID del Sheet original de la URL:
   ```
   https://docs.google.com/spreadsheets/d/<ESTE_ES_EL_ID>/edit
   ```

### Paso 2: Ejecutar el script de migración (UNA sola vez)

1. En el Sheet NUEVO: **Extensiones > Apps Script**
2. Borra todo el código que aparece (`myFunction() {}`)
3. Abre el archivo `migracion/migracion.gs` de este proyecto
4. Copia TODO su contenido y pégalo en el editor de Apps Script
5. Edita la línea ~35 con el ID del Sheet ORIGEN:
   ```javascript
   var ID_SHEET_ORIGEN = "1abc123..."; // ← pegar el ID real
   ```
6. En el selector de funciones, elige `migrarTodo` y haz clic en **Ejecutar** ▶
7. Autoriza los permisos que te solicite (es normal, necesita leer/escribir en Sheets)
8. Espera ~30-60 segundos. Verás alertas de progreso.
9. Recarga el Sheet nuevo → Deberías ver 9 hojas pobladas con los datos migrados

### Paso 3: Instalar el script de automatización permanente

1. En el editor de Apps Script, borra TODO el código (el de migración ya cumplió su función)
2. Abre el archivo `apps_script/Code.gs` de este proyecto
3. Copia TODO su contenido y pégalo en el editor
4. Edita la sección `CONFIG.ROLES` con los emails reales de tu equipo:
   ```javascript
   ROLES: {
     'maria@tuempresa.com': 'CREATIVO',
     'carlos@tuempresa.com': 'TECNICO',
     'lina@tuempresa.com': 'TRAZO_Y_CORTE',
     'coordinador@tuempresa.com': 'ADMIN'
   }
   ```
5. Edita `ALERT_EMAIL` con el correo que recibirá las alertas
6. Guarda (Ctrl+S o icono de disco)

### Paso 4: Activar menú y triggers

1. En el editor, selecciona la función `onOpen` y haz clic en **Ejecutar** ▶
2. Selecciona la función `instalarTriggers` y haz clic en **Ejecutar** ▶
3. Recarga el Google Sheet → aparecerá el menú **AtelierData** en la barra superior

### Paso 5: Verificar

El menú AtelierData debe mostrar:
- **Actualizar Dashboard**
- **Fotos >** Subir foto de referencia / tela
- **Consumos >** Nueva versión / Marcar como final
- **Comparar Costeo vs Contramuestra**
- **Enviar alertas por correo**
- **Importar parámetros**
- **Agregar tela a referencia**

## Flujo de Trabajo Diario

```
1. Diseñador Creativo ingresa consumos iniciales
   → Solo puede editar filas donde AREA=CREATIVO
   → Se registra en HISTORIAL automáticamente

2. Diseñador Técnico revisa y ajusta consumos
   → Solo puede editar filas donde AREA=TECNICO
   → Puede ver consumos creativos como referencia

3. Trazo y Corte verifica y marca ES_FINAL=TRUE
   → Al marcar ES_FINAL, se desmarca el anterior automáticamente
   → Este es el consumo oficial de costeo

4. Contramuestra: Trazo y Corte ingresa consumos reales
   → Se ingresan en hoja CONSUMOS_CONTRAMUESTRA
   → El sistema compara automáticamente (diario 8am)

5. Alerta si diferencia >5%
   → Se registra en hoja ALERTAS
   → Correo semanal (lunes 8am) con resumen de diferencias

6. Si una tela se descontinúa:
   → ACTIVE = FALSE en TELAS_X_REFERENCIA
   → La fila se pinta gris automáticamente
   → Se registra motivo y fecha en las columnas correspondientes
```

## Roles y Permisos

| Rol | Puede editar | Restricción |
|-----|-------------|-------------|
| CREATIVO | CONSUMOS (CONSUMO_VALOR, OBSERVACIONES) | Solo filas AREA=CREATIVO |
| TECNICO | CONSUMOS (CONSUMO_VALOR, OBSERVACIONES) | Solo filas AREA=TECNICO |
| TRAZO_Y_CORTE | CONSUMOS + CONSUMOS_CONTRAMUESTRA | Solo filas AREA=TRAZO_Y_CORTE |
| ADMIN | Todo | Sin restricciones |
| CONSULTA | Nada (solo lectura) | - |

## Automatizaciones

| Trigger | Frecuencia | Acción |
|---------|-----------|--------|
| `onEdit` | Cada edición | Validar rol, historial, auto-completado, formato |
| `tareaDiariaComparacion` | Diario 8am | Comparar costeo vs contramuestra, registrar alertas |
| `tareaSemanalCorreo` | Lunes 8am | Enviar correo con diferencias >5% |

## Archivos del Proyecto

```
migracion/
├── extract_validacion_telas.py   ← Extrae datos del HTML original
├── cargar_a_sheets.py            ← Carga CSVs a Google Sheets via API
├── schema.json                   ← Definición de estructura y reglas
├── output/                       ← CSVs generados
│   ├── referencias.csv
│   ├── telas_x_referencia.csv
│   ├── consumos_costeocre.csv
│   ├── consumos_costeodt.csv
│   ├── consumos_costeoet.csv
│   ├── consumos_contramuestra.csv
│   ├── insumos.csv
│   └── resumen.json
├── debug_grid.py                 ← Script de diagnóstico
└── debug_grid2.py                ← Script de diagnóstico v2

apps_script/
└── Code.gs                       ← Google Apps Script completo
```

## Reglas de Negocio Implementadas

| ID | Regla | Dónde se valida |
|----|-------|----------------|
| R01 | STATUS=APROBADO requiere CODIGO_TELA no vacío | `validarReglasNegocio()` |
| R02 | CONSUMO_VALOR > 0 en referencias activas | `onEdit()` en CONSUMOS col I |
| R03 | Solo un ES_FINAL=TRUE por tela/área | `onEdit()` en CONSUMOS col M |
| R04 | Diferencia >5% costeo vs contramuestra = alerta | `compararConsumos()` |
| R05 | CODIGO_TELA debe existir en PARAMETROS | `autoCompletarTela()` |

## Personalización

Para adaptar a otra colección (ej: FW27):

1. Cambiar `HTML_FILE` en `extract_validacion_telas.py`
2. Re-ejecutar extracción
3. Cargar en un nuevo Google Sheet
4. Copiar `Code.gs` y ajustar `CONFIG.ROLES`
