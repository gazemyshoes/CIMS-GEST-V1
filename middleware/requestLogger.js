/**
 * Middleware para logging de requests
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    // Log cuando termina la request
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            timestamp: new Date().toISOString()
        };

        // Solo log en desarrollo o si el status es error
        if (process.env.NODE_ENV === 'development' || res.statusCode >= 400) {
            console.log(`📝 ${logData.method} ${logData.path} ${logData.status} - ${logData.duration}`);
        }
    });

    next();
};

module.exports = requestLogger;
