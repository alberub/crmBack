const { Router } = require('express');
const { check } = require('express-validator');
const { ValidarAdmin } = require('../../middlewares/validar-admin');

const { validarJWT } = require('../../middlewares/validar-jwt');
const { 
        verificarClienteExistente,
        crearCliente,
        obtenerClientesPaginado, 
        desactivarCliente, 
        actualizarCliente,
        buscarClientes
     } = require('./clientes.controller');

const router = Router();

router.get('/verificarExistencia', verificarClienteExistente)

router.post('/crearCliente', crearCliente);

router.get('/obtenerClientes', obtenerClientesPaginado );

router.get('/buscarClientes', buscarClientes);

router.put('/actualizarCliente/:clienteId', [
  check('nombre', 'El nombre es obligatorio').not().isEmpty(),
  check('telefono', 'El teléfono es obligatorio').not().isEmpty(),
  check('email', 'El email es obligatorio').isEmail(),
  check('direccion_calle', 'La dirección calle es obligatoria').not().isEmpty(),
  check('direccion_colonia', 'La dirección colonia es obligatoria').not().isEmpty(),
  check('direccion_municipio', 'La dirección municipio es obligatoria').not().isEmpty()
], actualizarCliente );

router.delete('/desactivarCliente/:clienteId', desactivarCliente );

module.exports = router;