const Joi = require('joi');

const { crearCreditoSchema } =  require('../../creditos/validaciones/creditoSchema')

const actualizarClienteSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).required(),
  telefono: Joi.string().pattern(/^\d{10}$/).required().messages({
    'string.pattern.base': 'El teléfono debe contener exactamente 10 dígitos numéricos.'
  }),
  email: Joi.string().email().allow(null, '').optional(),
  direccion_calle: Joi.string().min(3).max(255).required(),
  direccion_colonia: Joi.string().min(3).max(100).required(),
  direccion_municipio: Joi.string().min(3).max(100).required()
});

const crearClienteSchema = Joi.object({
  nombre: Joi.string().max(200).required(),
  telefono: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      'string.pattern.base': 'El teléfono debe tener exactamente 10 dígitos numéricos',
    }),
  direccion_calle: Joi.string().max(200).required(),
  direccion_colonia: Joi.string().max(200).required(),
  direccion_municipio: Joi.string().max(100).required(),
  email: Joi.string()
            .email()
            .max(100)
            .optional()
            .allow(null, '')
            .messages({
              'string.email': 'El email debe tener un formato válido',
              'string.max': 'El email no puede exceder 100 caracteres'
            }),
      
  credito: crearCreditoSchema.required()

});

module.exports = {
  actualizarClienteSchema,
  crearClienteSchema
};