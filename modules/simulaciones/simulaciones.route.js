const { Router } = require('express');
const { check } = require('express-validator');
const { ValidarAdmin } = require('../../middlewares/validar-admin');

const { validarJWT } = require('../../middlewares/validar-jwt');

const { getReportePDF } = require('./simulaciones.controller');

const router = Router();

router.post('/crearSimulacion', getReportePDF);

module.exports = router;