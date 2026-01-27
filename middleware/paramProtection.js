const hpp = require('hpp');

/**
 * Middleware para protección contra la polución de parámetros HTTP
 * (HTTP Parameter Pollution - HPP)
 *
 * Evita que atacantes sobrescriban parámetros de la query con arrays.
 * Por ejemplo: ?sort=price&sort=user podría ser malicioso si se espera un solo sort.
 */
const paramProtection = hpp();

module.exports = paramProtection;
