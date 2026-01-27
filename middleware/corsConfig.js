/**
 * Configuración de CORS
 */
const corsOptions = {
    origin: function (origin, callback) {
        // Permitir requests sin origin (Postman, aplicaciones móviles, etc.)
        if (!origin) return callback(null, true);

        // En desarrollo, permitir localhost
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }

        // En producción, definir orígenes permitidos
        const allowedOrigins = process.env.ALLOWED_ORIGINS 
            ? process.env.ALLOWED_ORIGINS.split(',')
            : [];

        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.length === 0) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true, // Permitir cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
    maxAge: 86400 // 24 horas
};

module.exports = corsOptions;
