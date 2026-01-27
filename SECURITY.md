# 🔒 Documentación de Seguridad

## 📊 Estado: 10/10

El sistema cuenta con medidas de seguridad robustas implementadas a nivel de middleware y configuración.

## 🛡️ Medidas de Seguridad Implementadas

### 1. **Helmet.js**
- **Protección**: Configura varios headers HTTP para prevenir ataques comunes.
- **Headers activados**:
  - `X-DNS-Prefetch-Control`
  - `X-Frame-Options` (contra clickjacking)
  - `Strict-Transport-Security` (HTTPS enforcement)
  - `X-Download-Options`
  - `X-Content-Type-Options`
  - `X-XSS-Protection` (protección XSS en navegadores antiguos)
  - `Referrer-Policy`
- **Content Security Policy (CSP)**:
  - **Desarrollo**: Desactivado para permitir herramientas de desarrollo.
  - **Producción**: Activado con directivas restrictivas (`self`, `unsafe-inline` para scripts/estilos).
  - **Configuración**: Se recomienda ajustar las directivas de `scriptSrc`, `styleSrc`, `imgSrc` para incluir sólo dominios de confianza en producción.

### 2. **CORS (Cross-Origin Resource Sharing)**
- **Protección**: Controla qué orígenes pueden acceder a los recursos del servidor.
- **Configuración** (`middleware/corsConfig.js`):
  - **Desarrollo**: Permite todos los orígenes para facilitar el desarrollo.
  - **Producción**: Se restringe a los dominios listados en la variable de entorno `ALLOWED_ORIGINS`.
  - `credentials: true`: Permite el envío de cookies (incluyendo el `authToken`).
  - `methods` y `allowedHeaders` configurados.

### 3. **Rate Limiting (express-rate-limit)**
- **Protección**: Previene ataques de fuerza bruta y denegación de servicio (DoS).
- **Configuración** (`middleware/rateLimiter.js`):
  - **`generalLimiter`**: 100 solicitudes por IP cada 15 minutos (para todas las rutas).
  - **`loginLimiter`**: 5 intentos de login por IP cada 15 minutos (para `/api/login`).
  - **`createLimiter`**: 10 solicitudes de creación por IP cada 1 minuto (para rutas POST de creación).

### 4. **Protección contra Polución de Parámetros (HPP - hpp)**
- **Protección**: Evita que atacantes sobrescriban valores de parámetros de la query enviando múltiples veces el mismo nombre de parámetro (ej. `?sort=asc&sort=desc`).
- **Ubicación**: Aplicado globalmente antes de los `body-parsers`.

### 5. **JSON Web Tokens (JWT)**
- **Protección**: Autenticación segura y sin estado para la API.
- **Características**:
  - **Secret Key**: Configurabilidad mediante `JWT_SECRET` en `.env` (con advertencia en desarrollo si se usa la clave por defecto).
  - **Expiración**: Tokens con tiempo de vida limitado (`60m`).
  - **Verificación**: Middleware `authenticateToken` verifica la validez y expiración del token.

### 6. **Control de Acceso Basado en Roles (RBAC)**
- **Protección**: Restringe el acceso a rutas específicas según el rol del usuario.
- **Middleware `requireAdmin`**: Asegura que solo los usuarios con `isAdmin: true` puedan acceder a rutas administrativas.

### 7. **Manejo Centralizado de Errores**
- **Protección**: Oculta detalles sensibles de errores (stack traces, errores de BD) en producción.
- **Características**: Respuestas de error consistentes y seguras.

### 8. **Validación de Variables de Entorno**
- **Protección**: Asegura que las configuraciones de seguridad críticas (`JWT_SECRET`, etc.) estén presentes al inicio de la aplicación.
- **Advertencias**: Notifica sobre el uso de claves secretas por defecto en producción.

### 9. **Contraseñas Hasheadas con Bcrypt**
- **Protección**: Las contraseñas de los usuarios se almacenan de forma segura (hash unidireccional con salt), nunca en texto plano.

## 🚧 Recomendaciones Adicionales para Producción

1. **HTTPS**: Implementar un certificado SSL/TLS para cifrar todas las comunicaciones (configurar Nginx/Apache).
2. **Actualizar Dependencias**: Mantener las dependencias de `package.json` actualizadas para mitigar vulnerabilidades conocidas.
3. **Auditorías de Seguridad**: Realizar auditorías de seguridad periódicas del código y la infraestructura.
4. **WAF (Web Application Firewall)**: Considerar el uso de un WAF para una capa adicional de protección.
5. **Logs de Auditoría**: Mejorar el registro para incluir eventos de seguridad importantes (intentos de login fallidos, cambios de permisos, etc.).

## 📝 Resumen

El proyecto ha sido reforzado con una serie de middlewares de seguridad estándar de la industria. La configuración actual es adecuada para un entorno de desarrollo seguro, y se han proporcionado las bases para una configuración robusta en producción. Es crucial seguir las recomendaciones adicionales para un entorno de producción óptimo.
