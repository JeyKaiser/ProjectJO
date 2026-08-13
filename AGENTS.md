# AGENTS.md — Inventario de Agentes, Skills y Sistemas del Repositorio

> Este archivo es el índice canónico de todos los agentes, skills y sistemas
> complementarios que existen en el repositorio. Si una carpeta de configuración
> de agente/skill no aparece aquí, no debería existir. Esta es la base para la
> auditoría y consolidación realizada el 2026-08-13.

---

## 🧭 Estructura de carpetas

```
.config/opencode/opencode.json   ← Config del tool opencode (Plugin, MCP, skills.paths)
.opencode/agent/atelier-data.md  ← ÚNICA definición del agente atelier-data
.agents/                         ← Base de conocimiento + skills opencode
  atelier-data/                  ←   8 pilares documentales + scripts Python
  skills/                          ← Skills activas (SKILL.md c/u)
.antigravity/                   ← Sistema pedagógico frontend (independiente)
.claude/memory/                    ← Memoria de estudio (independiente)
.kilo/                            ← Estado de sesiones de Kilo Code (no agentes)
```

---

## 🤖 Agente opencode (1)

| Agente | Definición | Base de conocimiento | Función |
|--------|------------|----------------------|---------|
| `atelier-data` | `.opencode/agent/atelier-data.md` | `.agents/atelier-data/` (8 pilares + scripts) | Análisis textil, auditoría de Matriz JO, eficiencia de consumos, reportes premium sobre CSV/Excel. |

**Triggers del agente** (palabras clave que lo activan automáticamente):
`analizar colección`, `auditar matriz`, `segmentar tallas`, `eficiencia textil`,
`consumo tela`, `reporte colección`, `validar matriz`, `PROTOTIPO`, `matriz JO`.
También se activa ante archivos `*.csv` / `*.xlsx` con columnas `Ref`,
`Código MD`, `Código PT`, `Status`, `TOTAL`, `Diseñador`, `Consumo`, `Trazador`.

**Modos de operación:** Auditor, Analista, Reportero, Comparador, Escritor.

**Workflow de 4 fases:** FASE 1 Auditoría → FASE 2 Segmentación →
FASE 3 Eficiencia Textil → FASE 4 Reporte Premium (detallado en
`.agents/atelier-data/4_metodologia_trabajo.md`).

---

## 🧩 Skills opencode (3)

| Skill | Ubicación | Origen | Función |
|-------|-----------|--------|---------|
| `find-skills` | `.agents/skills/find-skills/SKILL.md` | vercel-labs/skills | Utilidad genérica para descubrir e instalar skills externas vía `npx skills`. |
| `supabase-postgres-best-practices` | `.agents/skills/supabase-postgres-best-practices/` | supabase | Guía de optimización Postgres/Supabase: índices, RLS, pooling, locks, monitoreo. 47 archivos de referencia. |
| — | (eliminada) | — | `apparel-analyzer` se fusionó con el agente `atelier-data` (era un wrapper duplicado del mismo workflow 4 fases). |

> `skills.paths` en `.config/opencode/opencode.json` apunta a `.agents/skills`
> (única carpeta de skills activa para opencode).

---

## 🎓 Sistemas complementarios (no son agentes opencode)

### `.antigravity/` — ProjectJO Learning Architect

**Función distinta:** mentoría para desarrollo frontend senior en React+Vite.
**NO es agente opencode**; es un sistema pedagógico leído por el agente de
aprendizaje Contextual del proyecto ProjectJO-Antigravity.

Estructura: 138 archivos con `agents/`, `context/`, `learning/`, `metrics/`,
`prompts/`, `sessions/`, `workflows/`, `analysis/`, `engines/`, `reports/`,
`profiling/`, `automation/`, `challenges/`, `evaluations/`.

No duplica funciones de `atelier-data` (textil). Se conserva intacto.

### `.claude/memory/` — Memoria de estudio

**Función distinta:** recuerdo estructurado del modo estudio del usuario
(`user_role.md`, `project_study_focus.md`). Pertenece a Claude Code.

No duplica agentes. Se conserva intacto.

### `.kilo/` — Sesiones de Kilo Code

**Función distinta:** state de sesiones de Kilo Code (`agent-manager.json`,
`package.json`). No contiene definiciones de agentes ni skills.

> El worktree obsoleto `silk-spleen` (rama sin commits exclusivos, atrasada
> 22 commits) se eliminó el 2026-08-13. La rama sigue en git por si se quiere
> recuperar con `git branch silk-spleen`/`git reflog`.

---

## ✅ Auditoría de consolidación (2026-08-13)

| Duplicación | Acción | Resultado |
|---|---|---|
| Agente `atelier-data` en 3 sitios (`.opencode/agent/`, inline `opencode.json`, skill `apparel-analyzer`) | Fusionar en `.opencode/agent/atelier-data.md` (front-matter + triggers + workflow) | 1 sola fuente de verdad |
| Skill `supabase-postgres-best-practices` en 2 carpetas (`.agents/skills/` y `.claude/skills/`) | Eliminar `.claude/skills/` | -36 archivos |
| Worktree `silk-spleen` (réplica obsoleta del repo, 0 commits exclusivos) | `git worktree remove --force` | carpeta `worktrees/` eliminada |
| `apparel-analyzer/SKILL.md` duplicando al agente | Eliminar la skill | -1 archivo + su carpeta |

**Impacto:** ~42 archivos eliminados, 1 sola fuente de verdad por agente/skill,
0 pérdida de funcionalidad (triggers, workflow, reglas, scripts y skills
externas preservadas).

**Recordatorio:** tras cualquier cambio en `.config/opencode/opencode.json`,
`.opencode/agent/` o `.agents/skills/`, **reiniciar opencode** para que
recargue la configuración (no se aplica hot-reload).