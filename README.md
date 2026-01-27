# Gestor de Activos

Sistema web para la gestión de activos empresariales, con control de asignaciones, incidencias, mantenimientos y usuarios.

## 🚀 Características

- **Gestión de Activos**: Registro, consulta y asignación de activos a empleados
- **Gestión de Empleados**: Administración de empleados y áreas
- **Gestión de Incidencias**: Registro y seguimiento de incidencias
- **Gestión de Usuarios**: Sistema de usuarios con roles (administrador/estándar)
- **Autenticación JWT**: Sistema seguro de autenticación con tokens
- **Control de Acceso**: Permisos diferenciados por rol de usuario

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- MySQL (v5.7 o superior)
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio** (o descargar el proyecto)

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar variables de entorno**:
   - Copiar `.env.example` a `.env`
   - Configurar las credenciales de la base de datos y otros parámetros

4. **Configurar la base de datos**:
   - Crear la base de datos MySQL
   - Ejecutar los scripts SQL necesarios (procedimientos almacenados)

5. **Iniciar el servidor**:
```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

El servidor se iniciará en `http://localhost:3000` (o el puerto configurado en `.env`)

## 📁 Estructura del Proyecto

```
GESTOR DE ACTIVOS/
├── config/                 # Configuración
│   ├── database.js        # Configuración de base de datos
│   └── jwt.js             # Configuración JWT
├── middleware/            # Middlewares
│   └── auth.js           # Autenticación y autorización
├── routes/                # Rutas de la API
│   ├── activoRoutes.js
│   ├── empleadoRoutes.js
│   ├── incidenciaRoutes.js
│   ├── usuarioRoutes.js
│   └── ...
├── scripts/               # Scripts de utilidad
│   └── updatePasswords.js
├── public/                # Frontend (estático)
│   ├── *.html            # Páginas
│   ├── *.js              # Scripts del frontend
│   └── assets/           # Recursos (CSS, imágenes)
├── server.js             # Servidor principal
├── db.js                 # Wrapper de compatibilidad
├── .env.example          # Ejemplo de variables de entorno
└── package.json          # Dependencias
```

## 🔐 Seguridad

- Las contraseñas se almacenan usando bcrypt
- Autenticación mediante JWT tokens
- Middleware de autenticación en rutas protegidas
- Control de acceso basado en roles

**⚠️ Importante**: Cambiar el `JWT_SECRET` en producción por una clave segura y única.

## 📝 Scripts Disponibles

- `npm start`: Inicia el servidor en modo producción
- `npm run dev`: Inicia el servidor en modo desarrollo con nodemon

## 🗄️ Base de Datos

El sistema utiliza procedimientos almacenados (stored procedures) en MySQL para las operaciones de base de datos. Asegúrate de tener todos los procedimientos necesarios creados en la base de datos.

## 👥 Roles de Usuario

- **Administrador**: Acceso completo al sistema, puede gestionar usuarios y empleados
- **Usuario Estándar**: Acceso limitado a consultas y registro de activos e incidencias

## 📄 Licencia

ISC

## 👨‍💻 Autor

Proyecto desarrollado para gestión de activos empresariales.
"# CIMS-GEST-V1" 
