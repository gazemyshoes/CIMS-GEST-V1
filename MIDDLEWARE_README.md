# 📚 Documentación de Middlewares

Este documento describe todos los middlewares implementados en el sistema.

## 🛡️ Middlewares de Seguridad

### 1. **Helmet.js** (`server.js`)
- **Ubicación**: Aplicado globalmente al inicio
- **Función**: Configura headers HTTP seguros
- **Configuración**: CSP desactivado para desarrollo (activar en producción)

### 2. **CORS Config** (`middleware/corsConfig.js`)
- **Ubicación**: Aplicado globalmente
- **Función**: Control de acceso cross-origin
- **Características**:
  - En desarrollo: permite todos los orígenes
  - En producción: usar `ALLOWED_ORIGINS` en `.env`
  - Soporta cookies (credentials: true)

### 3. **Rate Limiting** (`middleware/rateLimiter.js`)
- **generalLimiter**: 100 requests/15min (global)
- **loginLimiter**: 5 intentos/15min (protección brute force)
- **createLimiter**: 10 creaciones/min (disponible para uso futuro)

## 🔐 Middlewares de Autenticación

### 1. **authenticateToken** (`middleware/auth.js`)
- **Función**: Verifica JWT tokens
- **Ubicación de token**: Header `Authorization: Bearer <token>` o cookie `authToken`
- **Respuestas**:
  - 401: Token no proporcionado o inválido
  - 401: Token expirado
- **Agrega**: `req.user` con información del usuario

### 2. **requireAdmin** (`middleware/auth.js`)
- **Función**: Verifica permisos de administrador
- **Uso**: Después de `authenticateToken`
- **Respuesta**: 403 si no es administrador

### 3. **optionalAuth** (`middleware/auth.js`)
- **Función**: Autenticación opcional (no bloquea si no hay token)
- **Uso**: Para rutas que funcionan con o sin autenticación

## 📝 Middlewares de Logging

### 1. **requestLogger** (`middleware/requestLogger.js`)
- **Función**: Log de todas las requests
- **Información registrada**:
  - Método HTTP
  - Ruta
  - Status code
  - Duración
  - IP
  - User Agent
- **Nivel de log**: Solo errores en producción, todo en desarrollo

## ⚠️ Middlewares de Manejo de Errores

### 1. **errorHandler** (`middleware/errorHandler.js`)
- **Ubicación**: Al final, después de todas las rutas
- **Función**: Manejo centralizado de errores
- **Maneja**:
  - Errores de validación (400)
  - Errores JWT (401)
  - Errores de base de datos (500)
  - Errores personalizados con statusCode
  - Errores genéricos (500)

### 2. **notFoundHandler** (`middleware/errorHandler.js`)
- **Ubicación**: Antes de errorHandler
- **Función**: Captura rutas no encontradas (404)

### 3. **asyncHandler** (`middleware/errorHandler.js`)
- **Función**: Wrapper para manejar errores async en rutas
- **Uso**: `router.get('/ruta', asyncHandler(async (req, res) => {...}))`

## ✅ Middlewares de Validación

### 1. **validateEnv** (`middleware/validateEnv.js`)
- **Ubicación**: Se ejecuta al inicio de `server.js`
- **Función**: Valida variables de entorno requeridas
- **Variables requeridas**:
  - `DB_HOST`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`
  - `JWT_SECRET`
- **Advertencias**:
  - JWT_SECRET por defecto en producción
  - PORT no definido

## 📊 Orden de Middlewares en server.js

El orden es crítico. Los middlewares se aplican en este orden:

1. **Helmet** - Seguridad HTTP
2. **CORS** - Control de acceso
3. **Rate Limiting General** - Protección DDoS
4. **Body Parsers** - Parsear JSON/URL-encoded
5. **Cookie Parser** - Parsear cookies
6. **Request Logger** - Logging
7. **Static Files** - Archivos estáticos
8. **Rutas API** - Rutas de la aplicación
9. **Rutas HTML** - Páginas HTML
10. **Not Found Handler** - 404
11. **Error Handler** - Manejo de errores

## 🔧 Configuración

### Variables de entorno relacionadas:
```env
NODE_ENV=development|production
ALLOWED_ORIGINS=url1,url2,url3  # Para CORS en producción
JWT_SECRET=tu_clave_secreta
```

## 📝 Uso en Rutas

```javascript
// Ruta pública
router.get('/public', (req, res) => {...});

// Ruta protegida
router.get('/protected', authenticateToken, (req, res) => {...});

// Ruta solo admin
router.post('/admin', authenticateToken, requireAdmin, (req, res) => {...});

// Ruta con manejo async
router.get('/async', asyncHandler(async (req, res) => {
    // Tu código async
}));
```

## ✅ Estado: 10/10

Todos los middlewares esenciales están implementados y funcionando correctamente.
