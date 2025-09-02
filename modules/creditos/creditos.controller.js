const { 
    crearCreditoService, 
    obtenerCreditosPaginadoService, 
    obtenerDetalleCreditoService,
    obtenerCreditoCompletoService 
} = require('./creditos.service');
const { crearCreditoSchema } = require('./validaciones/creditoSchema');

const crearCredito = async(req, res) => {

    const { error, value } = crearCreditoSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errores = error.details.map(err => err.message);
        return res.status(400).json({ success: false, errors: errores });
    }

    try {
        const creditoCreado = await crearCreditoService(value);
        res.json({ 
            success: true,
            message: 'El crédito ha sido creado', 
            data: creditoCreado 
        });        
    } catch (error) { 
        const message = 'Ocurrió un error: crearCreditoService';
        res.status(409).json({ success: false, message: message });
    }

}

const obtenerDetalleCredito = async(req, res) => {

    try {
        const creditoId = req.query.credito_id;
        if (isNaN(creditoId)) {
        return res.status(400).json({
            success: false,
            message: 'Parámetro credito_id inválido'
        });
        }

        const result = await obtenerDetalleCreditoService(creditoId);

        res.json({
            success: true,
            data: result
        })
        
    } catch (error) {
        console.error('Error al obtener detalle crédito:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

const obtenerCreditoCompleto = async (req, res) => {
  const creditoId = parseInt(req.params.id, 10);
  if (isNaN(creditoId)) {
    return res.status(400).json({ error: 'ID de crédito inválido' });
  }

  try {

    const credito = await obtenerCreditoCompletoService(creditoId);
    if (!credito) {
      return res.status(404).json({ message: 'Crédito no encontrado' });
    }
    res.json({
        success: true,
        data: credito
    });
  } catch (err) {
    console.error('Error al obtener crédito completo: ', error);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
    });
  }
};

const obtenerCreditosPaginado = async (req, res) => {
  try {
    // Leer id_campestre de query, por defecto 0 (trae todos)
    const raw = req.query.id_campestre;
    const idCampestre = raw === undefined
      ? 0
      : parseInt(raw, 10);

    if (isNaN(idCampestre) || idCampestre < 0) {
      return res.status(400).json({
        success: false,
        message: 'Parámetro id_campestre inválido'
      });
    }

    const page  = parseInt(req.query.page,  10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const result = await obtenerCreditosPaginadoService(
      idCampestre,
      page,
      limit
    );

    res.json({
      success: true,
      data:    result.data,
      meta:    result.meta
    });
  } catch (error) {
    console.error('Error al obtener créditos paginados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
    crearCredito,
    obtenerCreditosPaginado,
    obtenerDetalleCredito,
    obtenerCreditoCompleto
}
