/**
 * Utilidades para manejar errores de MySQL
 */

/**
 * Convierte errores de MySQL a errores de la aplicación
 */
const handleDatabaseError = (error, defaultMessage = 'Error de base de datos') => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d195c6c9-6150-4a26-810e-0ef5c42ed7eb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'utils/dbErrorHandler.js:8',message:'handleDatabaseError ejecutado',data:{errorCode:error.code,sqlMessage:error.sqlMessage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    if (!error) return null;

    // Errores de clave duplicada
    if (error.code === 'ER_DUP_ENTRY') {
        const match = error.sqlMessage.match(/Duplicate entry '(.+?)' for key '(.+?)'/);
        const field = match ? match[2] : 'campo';
        return {
            statusCode: 409,
            message: `El ${field} ya existe`,
            isConflict: true
        };
    }

    // Error de foreign key constraint
    if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_ROW_IS_REFERENCED_2') {
        return {
            statusCode: 400,
            message: 'No se puede realizar la operación debido a referencias en otras tablas',
            isConstraint: true
        };
    }

    // Error de campo no puede ser nulo
    if (error.code === 'ER_BAD_NULL_ERROR') {
        return {
            statusCode: 400,
            message: 'Faltan campos obligatorios',
            isValidation: true
        };
    }

    // Error de datos truncados
    if (error.code === 'ER_DATA_TOO_LONG') {
        return {
            statusCode: 400,
            message: 'Los datos exceden el tamaño máximo permitido',
            isValidation: true
        };
    }

    // Error genérico de base de datos
    return {
        statusCode: 500,
        message: defaultMessage,
        isDatabase: true
    };
};

/**
 * Wrapper para queries de base de datos que maneja errores
 */
const handleQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        const db = require('../db');
        db.query(query, params, (err, results) => {
            if (err) {
                const errorInfo = handleDatabaseError(err);
                const error = new Error(errorInfo.message);
                error.statusCode = errorInfo.statusCode;
                error.isDatabase = true;
                error.originalError = err;
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

module.exports = {
    handleDatabaseError,
    handleQuery
};
