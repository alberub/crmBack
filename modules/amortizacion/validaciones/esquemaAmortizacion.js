const Joi = require('joi');

const esquemaAmortizacion = Joi.object({
  credito_id: Joi.number().integer().required(),
  tasa_anual: Joi.number().min(0).required(),
  plazo_anios: Joi.number().integer().min(1).required(),
  enganche: Joi.number().min(0).required(),
  costo_total: Joi.number().min(0).required(),
  anualidad: Joi.number().min(0).required(),
  fecha_inicio: Joi.date().required(),
  mes_anualidad: Joi.number().integer().min(1).max(12).required(),
  posponer_primera_anualidad: Joi.boolean().required()
});

module.exports = {
    esquemaAmortizacion
};