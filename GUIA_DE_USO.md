# 📖 Guía de Uso - Gestión de Colecciones JO

## 🚀 Inicio Rápido

### Requisitos
- Navegador web moderno (Chrome, Firefox, Edge)
- Live Server o cualquier servidor HTTP local

### Instalación y Ejecución

1. **Abrir con Live Server (Recomendado)**
   - Haz clic derecho en `index.html`
   - Selecciona "Open with Live Server"
   - La aplicación se abrirá automáticamente en tu navegador

2. **Abrir directamente**
   - Abre `index.html` en tu navegador
   - Nota: Algunas funcionalidades pueden requerir un servidor local

### Primera Vez

Al abrir la aplicación por primera vez:
- Se generarán automáticamente **60 referencias de prueba** (10 por cada colección)
- Los datos se almacenan en el navegador (localStorage)
- Los datos persisten entre sesiones

---

## 🎯 Funcionalidades Principales

### 1. Dashboard

El **Dashboard** es la vista principal que muestra:

- **KPIs Principales:**
  - Total de referencias
  - Total de unidades de producción
  - Referencias con bordado
  - Referencias con semielaborado

- **Gráficos de Distribución:**
  - Por Status (En Diseño, En Muestra, En Producción, etc.)
  - Por Colección (Winter Sun, Resort RTW, etc.)

- **Tablas Destacadas:**
  - Referencias recientes
  - Referencias prioritarias

**Cómo acceder:** Haz clic en "📊 Dashboard" en el sidebar

---

### 2. Lista de Referencias

Vista completa de todas las referencias con:

- **Filtros Avanzados:**
  - Por Colección
  - Por Status
  - Por Línea
  - Ordenamiento personalizado

- **Búsqueda Global:**
  - Busca por nombre, código, color, diseñador
  - Búsqueda en tiempo real

- **Tabla Interactiva:**
  - Ver todas las referencias
  - Acciones rápidas: Ver, Editar, Eliminar

**Cómo acceder:** Haz clic en "📋 Referencias" en el sidebar

**Acciones disponibles:**
- 👁️ **Ver:** Ver detalle completo de la referencia
- ✏️ **Editar:** Modificar la referencia
- 🗑️ **Eliminar:** Eliminar la referencia (con confirmación)

---

### 3. Detalle de Referencia

Vista completa de una referencia individual con secciones colapsables:

- **Información Básica:** Códigos, nombre, colección, diseñador
- **Características de la Prenda:** Línea, sublínea, tallaje, largo
- **Tela de Lucir:** Código, descripción, base textil
- **Procesos Especiales:** Bordado, semielaborado, procesos externos
- **Unidades de Producción:** Distribución por tallas
- **Moldería y Corte:** Fechas, comentarios, tipos de corte
- **Confección:** Modista, tiempos, status
- **Contramuestras:** Códigos OT, fechas de traslado

**Cómo acceder:** 
- Desde la lista, haz clic en el botón 👁️
- Desde el dashboard, haz clic en una referencia reciente o prioritaria

**Navegación:**
- **← Volver:** Regresa a la lista de referencias
- **✏️ Editar:** Abre el formulario de edición

---

### 4. Crear/Editar Referencia

Formulario organizado por secciones:

- **Información Básica** (campos obligatorios marcados con *)
- **Status**
- **Características de la Prenda**
- **Tela de Lucir**
- **Prioridad y Producción**

**Crear nueva referencia:**
1. Haz clic en "➕ Nueva Referencia" (botón superior derecho en la lista)
2. Completa los campos obligatorios
3. Haz clic en "💾 Guardar Referencia"

**Editar referencia existente:**
1. Desde la lista o detalle, haz clic en ✏️
2. Modifica los campos necesarios
3. Haz clic en "💾 Guardar Referencia"

---

## 🎨 Navegación por Colecciones

En el sidebar, puedes filtrar rápidamente por colección:

- ❄️ **Winter Sun**
- 🏖️ **Resort RTW**
- 🌸 **Spring Summer**
- ☀️ **Summer Vacation**
- 🍂 **Prefall RTW**
- 🍁 **Fall Winter**

Al hacer clic en una colección, se mostrará la lista filtrada automáticamente.

---

## 🔧 Herramientas

### Exportar Datos
- Descarga todos los datos en formato JSON
- Útil para respaldo o migración
- **Ubicación:** Sidebar → "📥 Exportar Datos"

### Regenerar Datos de Prueba
- Elimina todos los datos actuales
- Genera nuevos datos de prueba
- **Advertencia:** Esta acción reemplaza todos los datos
- **Ubicación:** Sidebar → "🔄 Regenerar Datos"

### Limpiar Datos
- Elimina TODOS los datos del sistema
- Requiere doble confirmación
- **Advertencia:** Esta acción NO se puede deshacer
- **Ubicación:** Sidebar → "🗑️ Limpiar Datos"

---

## 🔍 Búsqueda y Filtros

### Búsqueda Global (Header)
- Busca en tiempo real mientras escribes
- Busca en: nombre, código MD, código PT, color, diseñador
- Funciona en la vista de lista

### Selector de Colección (Header)
- Filtra rápidamente por colección
- Opción "Todas las Colecciones" para ver todo

### Filtros en Lista de Referencias
- **Colección:** Filtra por colección específica
- **Status:** Filtra por estado (En Diseño, En Producción, etc.)
- **Línea:** Filtra por línea de producto
- **Ordenar por:** Ordena por referencia, nombre, status o prioridad

**Los filtros se pueden combinar** para búsquedas más específicas.

---

## 💡 Consejos de Uso

### Productividad
1. **Usa la búsqueda global** para encontrar referencias rápidamente
2. **Combina filtros** para análisis específicos
3. **Exporta datos regularmente** como respaldo
4. **Usa las vistas del dashboard** para monitoreo general

### Gestión de Datos
- Los datos se guardan automáticamente en el navegador
- **No compartas el navegador** si trabajas con datos reales
- **Exporta datos antes de limpiar caché** del navegador
- Los datos son **locales** (no compartidos entre usuarios)

### Navegación
- Usa el **sidebar** para navegación principal
- Usa los **breadcrumbs** (← Volver) para regresar
- Las **secciones colapsables** en el detalle ayudan a organizar información

---

## 🎨 Características de Diseño

### Interfaz Premium
- Diseño moderno con gradientes vibrantes
- Glassmorphism en cards
- Animaciones suaves
- Responsive (adaptable a tablets y móviles)

### Badges de Status
- 🔵 **Azul:** En Producción
- 🟡 **Amarillo:** En Muestra/Contramuestra
- 🟢 **Verde:** Completado
- 🔴 **Rojo:** Prioridad alta
- ⚫ **Gris:** Pausado/Cancelado

---

## ⚠️ Limitaciones Actuales

### Almacenamiento
- Usa **localStorage** del navegador
- Límite aproximado: 5-10 MB
- Datos **no compartidos** entre navegadores o usuarios
- Datos **locales** a este dispositivo

### Funcionalidades Futuras
- Autenticación de usuarios
- Base de datos backend real
- Sincronización multi-usuario
- Upload real de imágenes
- Exportación a PDF/Excel
- Reportes avanzados

---

## 🐛 Solución de Problemas

### La aplicación no carga
1. Verifica que todos los archivos estén en la misma carpeta
2. Abre la consola del navegador (F12) para ver errores
3. Intenta con Live Server en lugar de abrir directamente

### Los datos no se guardan
1. Verifica que el navegador permita localStorage
2. Revisa que no estés en modo incógnito
3. Verifica el espacio disponible en localStorage

### Los filtros no funcionan
1. Recarga la página
2. Limpia la caché del navegador
3. Verifica que JavaScript esté habilitado

---

## 📞 Soporte

Para problemas o sugerencias:
- Revisa la consola del navegador (F12) para errores
- Exporta tus datos antes de reportar problemas
- Documenta los pasos para reproducir el problema

---

## 📝 Notas Técnicas

### Archivos del Proyecto
- `index.html` - Estructura principal
- `styles.css` - Sistema de diseño
- `data.js` - Modelos y gestión de datos
- `components.js` - Componentes UI
- `app.js` - Controlador principal

### Tecnologías
- HTML5
- CSS3 (Variables CSS, Flexbox, Grid)
- JavaScript ES6+ (Clases, Módulos)
- LocalStorage API

### Compatibilidad
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

---

**¡Disfruta gestionando tus colecciones! 👗✨**
