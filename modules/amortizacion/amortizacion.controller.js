const { esquemaAmortizacion } = require('./validaciones/esquemaAmortizacion');
const { generarYGuardarAmortizacion, consultarAmortizacionConMora } = require('./amortizacion.service');

const crearAmortizacionYGuardar = async (req, res) => { 

    try {            
        
        const { error, value } = esquemaAmortizacion.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            res.status(500).json({
                success: false,
                errorMessage: error.message
        });
        }

        const resultado = await generarYGuardarAmortizacion(value);

        res.json({
            success: true,
            datos: resultado
        });
    } catch (error) {        
        res.status(500).json({
            success: false,
            errorMessage: error.message
        });
    }
};

const obtenerAmortizacionConMora = async (req, res) => {
  const credito_id = parseInt(req.params.id);
  const cliente_id = req.params.clienteId;

  if (req.params.clienteId.includes(':')) {
  return res.status(400).json({
    success: false,
    message: 'Faltan parámetros reales en la URL'
  });
}

  if (isNaN(credito_id)) {
    return res.status(400).json({
      success: false,
      message: 'El crédito/cliente id debe ser un número válido.'
    });
  }

  try {
    const datos = await consultarAmortizacionConMora(cliente_id, credito_id);
    res.json({
      success: true,
      data: datos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al consultar la amortización con mora',
      error: error.message
    });
  }
};

module.exports = {
    crearAmortizacionYGuardar,
    obtenerAmortizacionConMora
};
