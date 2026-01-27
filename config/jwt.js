require('dotenv').config();

module.exports = {
    SECRET_KEY: process.env.JWT_SECRET,
    EXPIRES_IN: '60m'
};
