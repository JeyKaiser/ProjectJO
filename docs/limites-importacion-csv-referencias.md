# Límites operativos de importación CSV de referencias

Estos límites son configuración interna de protección y no agregan ni modifican
columnas del contrato CSV v0.1:

- archivo CSV en navegador/parser: máximo **5 MiB**;
- filas de datos por lote: máximo **5000**;
- documento JSON recibido por las RPC: máximo **8 MiB**, para contemplar la
  expansión de nombres de campo al transformar el CSV.

El parser, la interfaz y las RPC rechazan el exceso antes de procesar o escribir
el lote. Cambiar estos valores requiere revisar memoria del navegador, tiempo de
transacción y tamaño máximo de solicitud del entorno Supabase.
