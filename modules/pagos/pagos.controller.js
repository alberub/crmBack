const { crearPagoService } = require('./pagos.service');
const { crearPagoSchema } = require('./validaciones/pagoSchema')

const crearPago = async(req, res) => {

    const { error, value } = crearPagoSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errores = error.details.map(err => err.message);
        return res.status(400).json({ success: false, errors: errores });
    }

    try {

        await crearPagoService(value);
        res.json({
            success: true,
            message: 'El pago se ha relizado con éxito'
        })
        
    } catch (error) {
        const message = 'Ocurrió un error al cargar el pago';
        res.status(409).json({ success: false, message: message });
    }
}

module.exports = {
    crearPago
}