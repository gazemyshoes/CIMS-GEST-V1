const rateLimit = require('express-rate-limit');

/**
 * Rate limiter general para todas las rutas
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 500, // límite de 500 requests por ventana
    message: {
        success: false,
        error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde'
    },
    standardHeaders: true, // Retornar info de rate limit en headers
    legacyHeaders: false,
});

/**
 * Rate limiter estricto para login (protección contra brute force)
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 intentos de login por IP
    message: {
        success: false,
        error: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos'
    },
    skipSuccessfulRequests: true, // No contar requests exitosos
});

/**
 * Rate limiter para rutas de creación (POST)
 */
const createLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 10, // máximo 10 creaciones por minuto
    message: {
        success: false,
        error: 'Demasiadas solicitudes de creación. Intenta de nuevo más tarde'
    },
});

module.exports = {
    generalLimiter,
    loginLimiter,
    createLimiter
};
