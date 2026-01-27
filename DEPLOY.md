# 🚀 Guía de Despliegue a Producción

## ✅ Checklist Pre-Despliegue

### 1. Archivos a Subir (vía SFTP)

**IMPORTANTE**: NO subir estos archivos/carpetas:
- ❌ `node_modules/` (se instala en el servidor)
- ❌ `.env` (crearlo directamente en el servidor)
- ❌ `.git/` (si existe)
- ❌ Archivos de log (`*.log`)
- ❌ Archivos temporales

**SÍ subir:**
- ✅ Todo el código fuente (`.js`, `.html`, `.css`)
- ✅ `package.json` y `package-lock.json`
- ✅ Carpeta `public/` completa
- ✅ Carpeta `routes/` completa
- ✅ Carpeta `config/` completa
- ✅ Carpeta `middleware/` completa
- ✅ Carpeta `scripts/` (opcional, si necesitas ejecutar scripts)
- ✅ `server.js`
- ✅ `db.js`
- ✅ `README.md` (opcional)

### 2. Configuración del Servidor

#### A. Instalar Node.js
Asegúrate de tener Node.js instalado (v14 o superior):
```bash
node --version
npm --version
```

#### B. Instalar Dependencias
En el servidor, navega a la carpeta del proyecto y ejecuta:
```bash
npm install --production
```
(O simplemente `npm install` si también necesitas devDependencies como nodemon)

#### C. Crear Archivo .env
Crea un archivo `.env` en la raíz del proyecto con:
```env
# Configuración de Base de Datos
DB_HOST=tu_host_de_mysql
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=nombre_de_tu_base_de_datos
DB_PORT=3306

# Configuración del Servidor
PORT=3000
NODE_ENV=production # Establecer en 'production' para entorno de producción
ALLOWED_ORIGINS=https://tu-dominio.com,https://otro-dominio.com # Orígenes permitidos para CORS

# Configuración JWT (⚠️ CAMBIAR por una clave secreta segura y única)
JWT_SECRET=tu_clave_secreta_super_segura_aqui
```

**⚠️ IMPORTANTE**: Cambia `JWT_SECRET` por una clave aleatoria y segura en producción.

#### D. Verificar Base de Datos
- Asegúrate de que la base de datos MySQL esté accesible desde el servidor
- Verifica que todos los procedimientos almacenados (stored procedures) estén creados
- Prueba la conexión:
```bash
mysql -h DB_HOST -u DB_USER -p DB_NAME
```

### 3. Proceso Manager (Recomendado: PM2)

#### Instalar PM2:
```bash
npm install -g pm2
```

#### Iniciar la aplicación:
```bash
pm2 start server.js --name "gestor-activos"
```

#### Comandos útiles de PM2:
```bash
pm2 list              # Ver procesos
pm2 logs gestor-activos  # Ver logs
pm2 restart gestor-activos  # Reiniciar
pm2 stop gestor-activos     # Detener
pm2 save             # Guardar configuración
pm2 startup          # Iniciar al arrancar el servidor
```

### 4. Configurar Proxy Reverso (Nginx/Apache) - Opcional pero Recomendado

Si quieres usar un dominio y puerto 80/443, configura Nginx o Apache como proxy reverso.

#### Ejemplo Nginx:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Verificación Post-Despliegue

1. **Verificar que el servidor esté corriendo:**
   ```bash
   curl http://localhost:3000
   ```

2. **Verificar logs:**
   ```bash
   pm2 logs gestor-activos
   # O si no usas PM2:
   tail -f logs/app.log
   ```

3. **Probar la aplicación:**
   - Abre el navegador y ve a: `http://tu-servidor:3000`
   - Intenta hacer login
   - Verifica que las rutas funcionen correctamente

## 🔧 Troubleshooting

### Error: "Cannot find module"
- Ejecuta `npm install` en el servidor
- Verifica que `node_modules/` exista

### Error: "ECONNREFUSED" (Base de Datos)
- Verifica las credenciales en `.env`
- Asegúrate de que MySQL esté corriendo
- Verifica que el firewall permita conexiones a MySQL

### Error: "Port already in use"
- Cambia el puerto en `.env`
- O mata el proceso: `lsof -ti:3000 | xargs kill -9`

### La aplicación no inicia
- Verifica los logs: `pm2 logs` o `node server.js` (directo)
- Verifica que todas las variables de `.env` estén configuradas
- Verifica que la base de datos sea accesible

## 📝 Notas Importantes

1. **Seguridad:**
   - ⚠️ Cambia `JWT_SECRET` en producción
   - ⚠️ Usa HTTPS en producción (certificado SSL)
   - ⚠️ No expongas el archivo `.env` públicamente
   - ⚠️ Configura Content Security Policy (CSP) en `server.js` para producción (actualmente desactivado para desarrollo).

2. **Rendimiento:**
   - Usa PM2 o similar para mantener el proceso activo
   - Considera usar un proxy reverso (Nginx/Apache)
   - Configura logs rotativos

3. **Backup:**
   - Haz backup regular de la base de datos
   - Guarda copias del código y configuración

## 🎯 Comandos Rápidos de Despliegue

```bash
# 1. Subir archivos (desde tu máquina local, vía SFTP)
# (Sube todos los archivos excepto node_modules y .env)

# 2. En el servidor:
cd /ruta/a/tu/proyecto
npm install --production
cp .env.example .env  # Si tienes .env.example
nano .env  # Editar variables de entorno
pm2 start server.js --name "gestor-activos"
pm2 save
pm2 startup  # Configurar para iniciar al arrancar
```

¡Listo! Tu aplicación debería estar corriendo en producción. 🚀
