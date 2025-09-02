const { Router } = require('express');
const { check } = require('express-validator');
const { ValidarAdmin } = require('../../middlewares/validar-admin');

const { validarJWT } = require('../../middlewares/validar-jwt');
const { crearAmortizacionYGuardar, obtenerAmortizacionConMora } = require('./amortizacion.controller');

const router = Router();

router.post('/crearAmortizacion', crearAmortizacionYGuardar );
router.get('/obtenerAmortizacion/:clienteId/:id', obtenerAmortizacionConMora)

module.exports = router;