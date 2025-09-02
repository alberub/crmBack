const { Router } = require('express');
const { check } = require('express-validator');
const { ValidarAdmin } = require('../../middlewares/validar-admin');

const { validarJWT } = require('../../middlewares/validar-jwt');

const { crearPago } = require('./pagos.controller');

const router = Router();

router.post('/crearPago', crearPago);

module.exports = router;