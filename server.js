require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const paramProtection = require('./middleware/paramProtection');

// Validar variables de entorno al inicio
const validateEnv = require('./middleware/validateEnv');
validateEnv();

// CONEXIÓN A BASE DE DATOS (Agregado)
const db = require('./config/database');

// Middlewares personalizados
const corsOptions = require('./middleware/corsConfig');
const cors = require('cors');
const { authenticateToken, requireAdmin } = require('./middleware/auth');
const requestLogger = require('./middleware/requestLogger');
const { generalLimiter, loginLimiter, createLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Routes
const activoRoutes = require('./routes/activoRoutes');
const incidenciaRoutes = require('./routes/incidenciaRoutes');
const empleadoRoutes = require('./routes/empleadoRoutes');
const areaRoutes = require('./routes/areaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const mantenimientoRoutes = require('./routes/mantenimientoRoutes');
const asignacionesRoutes = require('./routes/asignacionesRoutes');
const loginRoutes = require('./routes/loginRoutes');

// Middleware de seguridad (debe ir primero)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https://*"],
            connectSrc: ["'self'", "http://20.48.228.65:3000"],  // ✅ API
            formAction: ["'self'", "http://20.48.228.65:3000"], // ✅ Formularios
            fontSrc: ["'self'", "https://cdn.jsdelivr.net"],      // ✅ Fuentes Bootstrap
        }
    },
    crossOriginEmbedderPolicy: false
}));

// Ruta para obtener datos del usuario actual
app.get('/api/user', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// Rutas de páginas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/index.html', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/ver-activos', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ver-activos.html'));
});

app.get('/consultar-empleados', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'consultar-empleados.html'));
});

app.get('/registrar-activo', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'registrar-activo.html'));
});

app.get('/registrar-incidencia', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'registrar-incidencia.html'));
});

app.get('/incidencias.html', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'consultar-incidencias.html'));
});

app.get('/registrar-empleado', authenticateToken, requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'registrar-empleado.html'));
});

app.get('/registrar-usuario', authenticateToken, requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'registrar-usuario.html'));
});


// CORS configurado
app.use(cors(corsOptions));

// Rate limiting general
app.use(generalLimiter);

// Protección contra polución de parámetros
app.use(paramProtection);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging de requests
app.use(requestLogger);

// Archivos estáticos
app.use(express.static('public'));

// Rutas API
// Login con rate limiting estricto
app.use('/api/login', loginLimiter);
app.use('/api', loginRoutes);

// Rutas protegidas con autenticación
app.use('/api', authenticateToken, [
    activoRoutes,
    incidenciaRoutes,
    empleadoRoutes,
    areaRoutes,
    usuarioRoutes,
    mantenimientoRoutes,
    asignacionesRoutes
]);


// Manejo de errores (debe ir al final, después de todas las rutas)
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
});
