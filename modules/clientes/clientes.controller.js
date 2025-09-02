const { obtenerClientesPaginadoService, 
        desactivarClienteService, 
        actualizarClienteService,
        buscarClientesService,
        crearClienteService,
        existeClienteService
      } = require('./clientes.service');

const { actualizarClienteSchema, crearClienteSchema } = require('./validaciones/clienteSchema');

const verificarClienteExistente = async(req, res) => {
  const { nombre, telefono } = req.query;

  if (!nombre && !telefono) {
    return res.status(400).json({
      success: false,
      message: 'Parámetros nombre y teléfono son requeridos'
    });
  }

  try {
    const existe = await existeClienteService(nombre, telefono);
    return res.status(200).json({ success: true, existe });
  } catch (error) {
    console.error('Error verificando cliente:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}

const crearCliente = async(req, res) => {

  const { error, value } = crearClienteSchema.validate(req.body, { abortEarly: false });

  if (error) {
    console.log('falla validando los campos');
    
    const errores = error.details.map(err => err.message);
    return res.status(400).json({ success: false, errors: errores });
  }

  try {
    const data = await crearClienteService(value);
    res.json({ 
      success: true,
      message: 'El cliente y crédito han sido creados', 
      data
    });
  } catch (err) {
    console.log(err, "linea 47");
    
    let message = 'Ocurrió un error, contacte al administrador';
    if (err.code === '23505') {
      message = 'Ya existe un cliente con los datos ingresados';
    }
    
    res.status(409).json({ success: false, message: message });
  }

}

const obtenerClientesPaginado = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await obtenerClientesPaginadoService(page, limit);

    res.json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    console.error('Error al obtener clientes paginados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const actualizarCliente = async (req, res) => {
  const { clienteId } = req.params;

  const { error, value } = actualizarClienteSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errores = error.details.map(err => err.message);
    return res.status(400).json({ success: false, errors: errores });
  }

  try {
    const clienteActualizado = await actualizarClienteService(clienteId, value);
    res.json({ 
      success: true,
      message: 'Los datos del cliente se han actualizado correctamente', 
      data: clienteActualizado 
    });
  } catch (err) {
    res.status(409).json({ success: false, message: err.message });
  }

}

const desactivarCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;

    const cliente = await desactivarClienteService(clienteId);

    res.json({
      success: true,
      message: 'Cliente desactivado correctamente',
      data: cliente
    });
  } catch (error) {
    console.error('Error al desactivar cliente:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  }
};

const buscarClientes = async (req, res) => {
  const { termino } = req.query;

  if (!termino || termino.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Debe proporcionar un término de búsqueda'
    });
  }

  try {
    const clientes = await buscarClientesService(termino.trim());
    res.json({ 
      success: true, 
      data: clientes 
    });
  } catch (error) {    
    res.status(500).json({
      success: false,
      message: 'Ocurrió un error al buscar clientes'
    });
  }
};

module.exports = {
  verificarClienteExistente,
  crearCliente,
  obtenerClientesPaginado,
  actualizarCliente,
  desactivarCliente,
  buscarClientes
};
