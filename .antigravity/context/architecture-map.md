# MAPA ARQUITECTÓNICO DEL PROYECTO

El proyecto ProjectJO-Antigravity tiene esta estructura conceptual:

## ENTRY POINT
- src/main.jsx

## ROOT APP
- src/App.jsx

## GLOBAL STATE
- src/context/AuthContext.jsx

## CORE UI
- src/components/
  - Sidebar.jsx
  - Header.jsx
  - TemperatureBar.jsx

## PÁGINAS PRINCIPALES
- Dashboard.jsx
- ColeccionesExplorer.jsx
- FichaTecnicaForm.jsx
- ReferenciaDetalle.jsx
- TallerKanban.jsx
- ConfiguracionPersonas.jsx
- ConsumosView.jsx
- FichaFinalView.jsx
- ReferentesView.jsx

## BUSINESS DATA
- src/data/colecciones.js
- src/data/personas.js
- src/data/referentes.js

## UTILS
- src/utils/codigos.js

# FLUJO PRINCIPAL

1. App.jsx controla navegación.
2. React Router DOM v7 maneja rutas dinámicas.
3. AuthContext controla autenticación y roles.
4. Pages orquestan vistas completas.
5. Components encapsulan UI reutilizable.
6. Data contiene información mockeada.
7. TemperatureBar representa estados semánticos del negocio.

# PROBLEMAS IDENTIFICADOS

- God Components grandes.
- CSS global monolítico.
- Posible acoplamiento UI + lógica.
- Riesgos de renderizado innecesario.
- Escalabilidad limitada.