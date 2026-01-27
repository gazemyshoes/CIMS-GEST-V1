/**
 * Validación de variables de entorno requeridas
 * Se ejecuta al inicio de la aplicación
 */
const validateEnv = () => {
    const requiredVars = [
        'DB_HOST',
        'DB_USER',
        'DB_PASSWORD',
        'DB_NAME',
        'JWT_SECRET'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.error('❌ Error: Faltan variables de entorno requeridas:');
        missingVars.forEach(varName => {
            console.error(`   - ${varName}`);
        });
        console.error('\nPor favor, crea un archivo .env con las variables necesarias.');
        console.error('Puedes usar .env.example como referencia.\n');
        process.exit(1);
    }

    // Validaciones adicionales
    if (process.env.JWT_SECRET === 'continental_2025' && process.env.NODE_ENV === 'production') {
        console.warn('⚠️  ADVERTENCIA: Estás usando el JWT_SECRET por defecto en producción.');
        console.warn('   Esto es un riesgo de seguridad. Cambia JWT_SECRET a una clave única y segura.\n');
    }

    if (!process.env.PORT) {
        console.warn('⚠️  PORT no está definido, usando puerto 3000 por defecto.\n');
    }

    console.log('✅ Variables de entorno validadas correctamente\n');
};

module.exports = validateEnv;
