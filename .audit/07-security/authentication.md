# Auditoría de Autenticación

## 1. Propósito
Garantizar que el sistema verifica la identidad de los usuarios de forma segura y estándar.

## 2. Criterios de Evaluación
- **Protocolos:** Uso de estándares (OAuth2, OIDC, JWT).
- **Manejo de Tokens:** Rotación, expiración, almacenamiento seguro.
- **Multifactor:** Implementación de MFA/2FA.
- **Password:** Políticas de complejidad, hasheo seguro (bcrypt/argon2).

## 3. Pasos de Ejecución
1. **Inspección de Login:** Verificar flujo de autenticación.
2. **Prueba de Tokens:** Revisar validez, expiración y firma de JWTs.
3. **Revisión de Hash:** Validar si se usan algoritmos débiles (ej. MD5, SHA1).

## 4. Evidencia Requerida
- Capturas de payloads de autenticación.
- Análisis de fuerza bruta o de complejidad de contraseñas.
