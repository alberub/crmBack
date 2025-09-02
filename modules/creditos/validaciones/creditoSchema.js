const Joi = require('joi');

const crearCreditoSchema = Joi.object({

  fecha_inicio: Joi.string()
    .isoDate()
    .required(),

  plazo_meses: Joi.number()
    .integer()
    .positive()
    .required(),

  tasa_anual: Joi.number()
    .precision(5)
    .min(0)
    .required(),

  enganche: Joi.number()
    .precision(2)
    .min(0)
    .required(),

  costo_terreno: Joi.number()
    .precision(2)
    .min(0)
    .required(),

  lote: Joi.number()
    .integer()
    .min(1)
    .required(),

  manzana: Joi.number()
    .integer()
    .min(1)
    .required(),

  id_campestre: Joi.number()
    .integer()
    .min(1)
    .required(),

  posponer_primera_anualidad: Joi.boolean()
    .default(false),

  mes_anualidad: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .required(),

  anualidad: Joi.number()
    .precision(2)
    .min(0)
    .required(),

  precio_metro: Joi.number()
    .precision(2)
    .min(0)
    .required()
});

module.exports = {
  crearCreditoSchema
};
