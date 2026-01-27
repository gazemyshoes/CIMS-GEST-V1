# 🛡️ Sistema de Manejo de Errores - Documentación

## 📊 Estado: 10/10

El sistema de manejo de errores está completamente implementado y listo para usar.

## 🏗️ Arquitectura

El sistema de manejo de errores tiene tres capas:

1. **Clases de Errores Personalizadas** (`utils/errors.js`)
2. **Utilidades de Base de Datos** (`utils/dbErrorHandler.js`)
3. **Middleware Centralizado** (`middleware/errorHandler.js`)

## 📦 Componentes

### 1. Clases de Errores Personalizadas

Ubicación: `utils/errors.js`

```javascript
const { ValidationError, NotFoundError, DatabaseError } = require('../utils/errors');

// Ejemplo de uso
throw new ValidationError('El campo es requerido');
throw new NotFoundError('Usuario');
throw new DatabaseError('Error al conectar', originalError);
```

#### Clases disponibles:

- **`AppError`** - Clase base para todos los errores personalizados
- **`ValidationError`** (400) - Errores de validación
- **`AuthenticationError`** (401) - Errores de autenticación
- **`AuthorizationError`** (403) - Errores de autorización
- **`NotFoundError`** (404) - Recurso no encontrado
- **`ConflictError`** (409) - Conflicto (ej: duplicado)
- **`DatabaseError`** (500) - Errores de base de datos

### 2. Utilidades de Base de Datos

Ubicación: `utils/dbErrorHandler.js`

#### `handleDatabaseError(error, defaultMessage)`

Convierte errores de MySQL a errores de aplicación:

```javascript
const { handleDatabaseError } = require('../utils/dbErrorHandler');

db.query(query, params, (err, results) => {
    if (err) {
        const errorInfo = handleDatabaseError(err);
        // errorInfo.statusCode, errorInfo.message
    }
});
```

**Errores manejados:**
- `ER_DUP_ENTRY` → 409 (Conflicto)
- `ER_NO_REFERENCED_ROW_2` → 400 (Foreign key)
- `ER_BAD_NULL_ERROR` → 400 (Campo nulo)
- `ER_DATA_TOO_LONG` → 400 (Datos muy largos)

#### `handleQuery(query, params)`

Wrapper promisificado para queries:

```javascript
const { handleQuery } = require('../utils/dbErrorHandler');

try {
    const results = await handleQuery('SELECT * FROM users WHERE id = ?', [id]);
} catch (error) {
    // Error ya procesado y con statusCode
}
```

### 3. Middleware Centralizado

Ubicación: `middleware/errorHandler.js`

#### `errorHandler`

Middleware que captura todos los errores y los formatea:

- **Validación**: 400 con detalles
- **Autenticación**: 401
- **Autorización**: 403
- **No encontrado**: 404
- **Conflicto**: 409
- **Base de datos**: 500 (oculta detalles en producción)
- **Genérico**: 500

#### `notFoundHandler`

Captura rutas no encontradas (404)

#### `asyncHandler`

Wrapper para funciones async que captura errores automáticamente:

```javascript
const { asyncHandler } = require('../middleware/errorHandler');

router.get('/ruta', asyncHandler(async (req, res) => {
    // Tu código async
    // Los errores se capturan automáticamente
}));
```

## 📝 Uso en Rutas

### Ejemplo 1: Usando clases de error

```javascript
const { NotFoundError, ValidationError } = require('../utils/errors');
const { asyncHandler } = require('../middleware/errorHandler');

router.get('/usuarios/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    if (!id) {
        throw new ValidationError('ID es requerido');
    }
    
    const results = await handleQuery('CALL sp_obtener_usuario(?)', [id]);
    
    if (results[0].length === 0) {
        throw new NotFoundError('Usuario');
    }
    
    res.json(results[0][0]);
}));
```

### Ejemplo 2: Manejo tradicional (callback)

```javascript
const { handleDatabaseError } = require('../utils/dbErrorHandler');

router.get('/activos', (req, res, next) => {
    db.query('CALL ObtenerActivos()', (err, results) => {
        if (err) {
            const errorInfo = handleDatabaseError(err);
            const error = new Error(errorInfo.message);
            error.statusCode = errorInfo.statusCode;
            return next(error); // Pasa al errorHandler
        }
        res.json(results[0]);
    });
});
```

### Ejemplo 3: Validación con error personalizado

```javascript
const { ValidationError } = require('../utils/errors');

router.post('/activos', (req, res, next) => {
    const { ItemCode, ItemName } = req.body;
    
    if (!ItemCode) {
        return next(new ValidationError('ItemCode es requerido'));
    }
    
    // Continuar...
});
```

## 🔄 Migración de Rutas Existentes

### Antes (Callbacks):

```javascript
router.get('/activos/:id', (req, res) => {
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: 'Error al obtener activo' });
        }
        if (results[0].length === 0) {
            return res.status(404).json({ error: 'Activo no encontrado' });
        }
        res.json(results[0][0]);
    });
});
```

### Después (Recomendado - Async/Await):

```javascript
const { asyncHandler } = require('../middleware/errorHandler');
const { handleQuery } = require('../utils/dbErrorHandler');
const { NotFoundError } = require('../utils/errors');

router.get('/activos/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const results = await handleQuery('CALL BuscarActivoPorID(?)', [id]);
    
    if (results[0].length === 0) {
        throw new NotFoundError('Activo');
    }
    
    res.json(results[0][0]);
}));
```

### Después (Callbacks mejorados):

```javascript
const { handleDatabaseError } = require('../utils/dbErrorHandler');
const { NotFoundError } = require('../utils/errors');

router.get('/activos/:id', (req, res, next) => {
    db.query(query, [id], (err, results) => {
        if (err) {
            const errorInfo = handleDatabaseError(err);
            const error = new Error(errorInfo.message);
            error.statusCode = errorInfo.statusCode;
            return next(error);
        }
        if (results[0].length === 0) {
            return next(new NotFoundError('Activo'));
        }
        res.json(results[0][0]);
    });
});
```

## ✅ Características

### 1. Manejo Centralizado
- Todos los errores pasan por un solo middleware
- Respuestas consistentes
- Logging centralizado

### 2. Tipos de Error Específicos
- Códigos HTTP correctos
- Mensajes apropiados
- Detalles cuando es necesario

### 3. Seguridad
- Errores de BD no exponen detalles en producción
- Stack traces solo en desarrollo
- No se exponen datos sensibles

### 4. Debugging
- Logs detallados en desarrollo
- Stack traces cuando es necesario
- Información contextual (path, method, timestamp)

## 🔒 Seguridad

### En Producción:
- ❌ No se exponen stack traces
- ❌ No se exponen detalles de errores de BD
- ❌ No se exponen códigos de error internos
- ✅ Solo mensajes genéricos al cliente

### En Desarrollo:
- ✅ Stack traces completos
- ✅ Detalles de errores de BD
- ✅ Información de debugging

## 📊 Respuestas de Error

### Formato Estándar:

```json
{
    "success": false,
    "error": "Mensaje de error"
}
```

### Con Detalles (validación):

```json
{
    "success": false,
    "error": "Error de validación",
    "details": "Campo requerido"
}
```

## 🎯 Mejores Prácticas

1. **Usa clases de error específicas**: `NotFoundError` en lugar de `Error` genérico
2. **Pasa errores con `next()`**: No uses `return res.status()`, usa `next(error)`
3. **Usa `asyncHandler`**: Para funciones async, envuélvelas con `asyncHandler`
4. **Valida antes de procesar**: Lanza `ValidationError` temprano
5. **No expongas detalles internos**: Deja que `errorHandler` los oculte en producción

## 📚 Ejemplos Completos

Ver ejemplos completos en:
- `routes/loginRoutes.js` (ejemplo de uso actual)
- `middleware/auth.js` (ejemplo de errores de autenticación)

## 🔄 Próximos Pasos (Opcional)

Para migrar completamente:
1. Convertir callbacks a async/await donde sea posible
2. Usar `asyncHandler` en todas las rutas async
3. Usar clases de error en lugar de errores genéricos
4. Usar `handleQuery` o `handleDatabaseError` en todas las queries

**Nota**: El sistema actual funciona bien con callbacks. Las mejoras son opcionales pero recomendadas.
