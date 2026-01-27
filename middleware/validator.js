/**
 * Middleware para validación de datos de entrada (ejemplo simple)
 */
const { ValidationError } = require('../utils/errors');

const validate = (schema) => (req, res, next) => {
    try {
        // Validar req.body
        if (schema.body) {
            const { error } = schema.body.validate(req.body, { abortEarly: false });
            if (error) {
                const details = error.details.map(d => d.message).join('; ');
                throw new ValidationError(`Error de validación en el cuerpo: ${details}`);
            }
        }

        // Validar req.params
        if (schema.params) {
            const { error } = schema.params.validate(req.params, { abortEarly: false });
            if (error) {
                const details = error.details.map(d => d.message).join('; ');
                throw new ValidationError(`Error de validación en parámetros: ${details}`);
            }
        }

        // Validar req.query
        if (schema.query) {
            const { error } = schema.query.validate(req.query, { abortEarly: false });
            if (error) {
                const details = error.details.map(d => d.message).join('; ');
                throw new ValidationError(`Error de validación en query: ${details}`);
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = validate;
