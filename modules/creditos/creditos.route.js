const { Router } = require('express');
const { check } = require('express-validator');
const { ValidarAdmin } = require('../../middlewares/validar-admin');

const { validarJWT } = require('../../middlewares/validar-jwt');
const { crearCredito, 
        obtenerCreditosPaginado, 
        obtenerDetalleCredito,
        obtenerCreditoCompleto
    } = require('./creditos.controller');

const router = Router();

router.post('/crearCredito', crearCredito);
router.get('/obtenerCreditos', obtenerCreditosPaginado);
router.get('/obtenerDetalleCredito', obtenerDetalleCredito);
router.get('/obtenerInformacionCredito/:id', obtenerCreditoCompleto)

module.exports = router;