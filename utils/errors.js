/**
 * Clases de errores personalizadas
 */

/**
 * Error personalizado base
 */
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error de validación (400)
 */
class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, 400);
        this.name = 'ValidationError';
        this.details = details;
    }
}

/**
 * Error de autenticación (401)
 */
class AuthenticationError extends AppError {
    constructor(message = 'No autorizado') {
        super(message, 401);
        this.name = 'AuthenticationError';
    }
}

/**
 * Error de autorización (403)
 */
class AuthorizationError extends AppError {
    constructor(message = 'Acceso denegado') {
        super(message, 403);
        this.name = 'AuthorizationError';
    }
}

/**
 * Error de recurso no encontrado (404)
 */
class NotFoundError extends AppError {
    constructor(resource = 'Recurso') {
        super(`${resource} no encontrado`, 404);
        this.name = 'NotFoundError';
    }
}

/**
 * Error de conflicto (409)
 */
class ConflictError extends AppError {
    constructor(message = 'Conflicto en la solicitud') {
        super(message, 409);
        this.name = 'ConflictError';
    }
}

/**
 * Error de base de datos
 */
class DatabaseError extends AppError {
    constructor(message, originalError = null) {
        super(message || 'Error de base de datos', 500);
        this.name = 'DatabaseError';
        this.originalError = originalError;
    }
}

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    DatabaseError
};
