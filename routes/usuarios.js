const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');

const { validarJWT } = require('../middlewares/validar-jwt');
const { crearUsuario, validar } = require('../controllers/usuarios');

const router = Router();

router.post('/nuevo', validarJWT, crearUsuario );

// router.post('/validar', validar );

module.exports = router;