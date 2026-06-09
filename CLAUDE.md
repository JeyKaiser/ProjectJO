# 📚 CLAUDE.md - Documentación del Proyecto

## Proyecto: Gestión de Colecciones de Moda (JO)

**Tipo:** Aplicación React + Vite  
**Propósito:** Gestionar referencias de ropa, procesos de producción y análisis de colecciones textiles  
**Stack:** HTML5, CSS3, JavaScript ES6+, React, Vite  
**Datos:** localStorage (local browser storage)  

---

## 📁 Estructura del Proyecto

```
/
├── index.html           # Estructura principal
├── styles.css           # Sistema de diseño (gradientes, glassmorphism)
├── data.js              # Modelos y gestión de datos
├── components.js        # Componentes UI reutilizables
├── app.js               # Controlador principal (router, estado)
├── supabase.js          # Integración Supabase (si aplica)
└── docs/                # Documentación
```

---

## 🎯 Conceptos Clave

### Referencia (Reference)
Representa una prenda individual en el sistema:
- **Códigos:** MD (diseño), PT (producción)
- **Características:** Línea, sublínea, talla, largo
- **Procesos:** Bordado, semielaborado, procesos externos
- **Tela:** Código, descripción, base textil
- **Producción:** Modista, tiempos, status
- **Unidades:** Distribución por tallas

### Colecciones Principales
- ❄️ Winter Sun
- 🏖️ Resort RTW
- 🌸 Spring Summer
- ☀️ Summer Vacation
- 🍂 Prefall RTW
- 🍁 Fall Winter

### Status de Referencia
- En Diseño
- En Muestra
- En Producción
- Completado
- Pausado

---

## 🏗️ Arquitectura

### app.js - Router Principal
Maneja navegación entre vistas:
- Dashboard
- Lista de Referencias
- Detalle de Referencia
- Crear/Editar Referencia
- Herramientas

### data.js - Capa de Datos
- Modelos de Reference, Collection
- Métodos CRUD
- Generación de datos de prueba
- Integración con localStorage/Supabase

### components.js - Componentes UI
- Header con búsqueda y filtros
- Sidebar con navegación
- Tablas, formularios, cards
- Badges y indicadores

### styles.css - Diseño
- Variables CSS (colores, espaciado)
- Glassmorphism para cards
- Gradientes vibrantes
- Responsive design

---

## 🔄 Flujo de Datos

```
User Input (UI) 
    ↓
components.js (captura)
    ↓
app.js (maneja lógica)
    ↓
data.js (modifica estado)
    ↓
localStorage (persiste)
    ↓
components.js (re-renderiza)
```

---

## 📊 Vistas Principales

| Vista | Propósito | Archivos |
|-------|-----------|----------|
| Dashboard | KPIs y gráficos | app.js, components.js |
| Lista Referencias | Tabla con filtros | app.js, components.js |
| Detalle | Vista completa de referencia | app.js, components.js |
| CRUD | Crear/Editar | app.js, components.js |

---

## 🎓 Temas de Estudio

1. **Fundamentos:** Estructura React, estado, localStorage
2. **Modelos:** Clases Reference, Collection, business logic
3. **UI/UX:** Componentes, formularios, validación
4. **Features:** Filtrado, búsqueda, exportación
5. **Integración:** Supabase, sincronización

---

## 🔗 Archivos Relacionados

- GUIA_DE_USO.md - Manual de usuario
- README_ATELIERDATA.md - Contexto AtelierData
- IMPLEMENTATION_GUIDE.md - Guía de implementación
- Walkthrough.md - Tutorial paso a paso

---

## 🚀 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview
```

---

## 📝 Notas del Desarrollador

- Datos de prueba: 60 referencias (10 por colección)
- Límite localStorage: ~5-10 MB
- Responsive: Chrome 90+, Firefox 88+, Safari 14+
- No hay autenticación (datos locales)

