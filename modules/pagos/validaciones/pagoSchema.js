const Joi = require('joi');

const crearPagoSchema = Joi.object({
    credito_id: Joi.number().min(0).required(),
    monto: Joi.number().min(0).required(),
    fecha: Joi.string().min(10).max(10).required()
});

module.exports = {
    crearPagoSchema
}