# Scalability Report Template

## Objetivo
Evaluar cómo reaccionará la arquitectura ante crecimiento en usuarios, datos, equipos y funcionalidad.

## Factores de escalabilidad
- cantidad de vistas
- crecimiento del estado
- complejidad del dominio
- evolución del routing
- tamaño del CSS
- expansión del equipo

## Preguntas de diagnóstico
- ¿Qué parte colapsa primero?
- ¿Qué módulos son más frágiles?
- ¿La estructura soporta nuevas features?
- ¿Se puede dividir sin romper todo?
- ¿Qué necesita desacoplarse ya?

## Riesgos
- monolitos funcionales
- providers enormes
- CSS global inmanejable
- lógica de negocio dispersa
- rutas pesadas sin lazy loading

## Salida esperada
- nivel de escalabilidad actual
- cuellos de botella
- mejoras prioritarias
- visión de evolución arquitectónica