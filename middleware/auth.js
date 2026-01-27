const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config/jwt');

/**
 * Middleware para verificar JWT
 * Extrae el token de Authorization header o de cookies
 */
const authenticateToken = (req, res, next) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d195c6c9-6150-4a26-810e-0ef5c42ed7eb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware/auth.js:8',message:'authenticateToken activado',data:{path:req.path},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    let token = null;
    
    // Intentar obtener token del header Authorization
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } 
    // Si no está en header, intentar desde cookie
    else if (req.cookies && req.cookies.authToken) {
        token = req.cookies.authToken;
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado: Token no proporcionado'
        });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            // Diferentes tipos de errores JWT
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Token expirado'
                });
            }
            if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    error: 'Token inválido'
                });
            }
            return res.status(401).json({
                success: false,
                error: 'Error al verificar token'
            });
        }

        // Token válido, agregar información del usuario al request
        req.user = decoded;
        next();
    });
};

/**
 * Middleware para requerir permisos de administrador
 * Debe usarse después de authenticateToken
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado: Usuario no autenticado'
        });
    }

    if (!req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            error: 'Acceso denegado: Requiere permisos de administrador'
        });
    }

    next();
};

/**
 * Middleware opcional: Obtener usuario si existe token (no bloquea si no hay)
 * Útil para rutas que funcionan con o sin autenticación
 */
const optionalAuth = (req, res, next) => {
    let token = null;
    
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.authToken) {
        token = req.cookies.authToken;
    }

    if (token) {
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (!err) {
                req.user = decoded;
            }
            next();
        });
    } else {
        next();
    }
};

module.exports = {
    authenticateToken,
    requireAdmin,
    optionalAuth
};
