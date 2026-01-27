/**
 * Middleware centralizado para manejo de errores
 */
const errorHandler = (err, req, res, next) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d195c6c9-6150-4a26-810e-0ef5c42ed7eb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware/errorHandler.js:4',message:'errorHandler activado',data:{errorName:err.name,statusCode:err.statusCode,path:req.path},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // Si la respuesta ya fue enviada, delegar al handler por defecto de Express
    if (res.headersSent) {
        return next(err);
    }

    // Determinar status code
    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || 'Error interno del servidor';

    // Log del error (sin datos sensibles)
    const errorLog = {
        message: err.message,
        statusCode,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            code: err.code
        })
    };

    // Error de validación
    if (err.name === 'ValidationError' || statusCode === 400) {
        statusCode = 400;
        console.error('❌ Error de validación:', errorLog);
        return res.status(statusCode).json({
            success: false,
            error: message,
            ...(err.details && { details: err.details })
        });
    }

    // Error de autenticación
    if (err.name === 'AuthenticationError' || err.name === 'JsonWebTokenError') {
        statusCode = 401;
        console.error('❌ Error de autenticación:', errorLog);
        return res.status(statusCode).json({
            success: false,
            error: message
        });
    }

    // Error de token expirado
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        console.error('❌ Token expirado:', errorLog);
        return res.status(statusCode).json({
            success: false,
            error: 'Token expirado'
        });
    }

    // Error de autorización
    if (err.name === 'AuthorizationError' || statusCode === 403) {
        statusCode = 403;
        console.error('❌ Error de autorización:', errorLog);
        return res.status(statusCode).json({
            success: false,
            error: message
        });
    }

    // Error de recurso no encontrado
    if (err.name === 'NotFoundError' || statusCode === 404) {
        statusCode = 404;
        console.error('❌ Recurso no encontrado:', errorLog);
        return res.status(statusCode).json({
            success: false,
            error: message
        });
    }

    // Error de conflicto
    if (err.name === 'ConflictError' || statusCode === 409) {
        statusCode = 409;
        console.error('❌ Error de conflicto:', errorLog);
        return res.status(statusCode).json({
            success: false,
            error: message
        });
    }

    // Error de base de datos
    if (err.isDatabase || (err.code && err.code.startsWith('ER_'))) {
        statusCode = 500;
        console.error('❌ Error de base de datos:', errorLog);
        
        // En producción, no exponer detalles del error de BD
        const dbMessage = process.env.NODE_ENV === 'production' 
            ? 'Error interno del servidor' 
            : err.message;

        return res.status(statusCode).json({
            success: false,
            error: dbMessage
        });
    }

    // Error operacional (error conocido)
    if (err.isOperational) {
        console.error('❌ Error operacional:', errorLog);
        return res.status(statusCode).json({
            success: false,
            error: message
        });
    }

    // Error de programación o desconocido
    console.error('❌ Error desconocido:', errorLog);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
            ? 'Error interno del servidor' 
            : message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            name: err.name
        })
    });
};

/**
 * Middleware para capturar errores 404 (ruta no encontrada)
 */
const notFoundHandler = (req, res, next) => {
    const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

/**
 * Wrapper para manejar errores async en rutas
 */
const asyncHandler = (fn) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d195c6c9-6150-4a26-810e-0ef5c42ed7eb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware/errorHandler.js:139',message:'asyncHandler aplicado',timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler
};
