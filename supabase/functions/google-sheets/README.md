# Google Sheets Function

La funcion acepta unicamente solicitudes `POST` con una sesion Auth valida.
Solo permite los roles `Administrador`, `Cortador` y `Líder de Cortadores`.

Antes del despliegue, configurar los secretos de Supabase:

```bash
supabase secrets set ALLOWED_ORIGINS="https://app.example.com,http://localhost:5173"
supabase secrets set GOOGLE_SERVICE_ACCOUNT_JSON="<json-del-service-account>"
```

`ALLOWED_ORIGINS` debe contener los origenes exactos, separados por coma. No
usar `*` en un entorno real.

La funcion usa `SUPABASE_URL` y `SUPABASE_ANON_KEY` provistos por Supabase para
validar el JWT y consultar la cuenta enlazada en `jo.user_accounts`.
