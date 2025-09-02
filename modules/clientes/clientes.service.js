const { pool } = require('../../database/config');
const { crearCreditoService } = require('../creditos/creditos.service')

async function existeClienteService(nombre, telefono) {
  
  const query = `
    SELECT 1
    FROM clientes
    WHERE LOWER(nombre) = LOWER($1)
      AND telefono = $2
    LIMIT 1;
  `;
  const values = [nombre, telefono];
  const result = await pool.query(query, values);

  return result.rowCount > 0;
}

async function crearClienteService(data) {
  const {
    nombre,
    telefono,
    direccion_calle,
    direccion_colonia,
    direccion_municipio,
    email,
    credito
  } = data;

  const estado = true;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const query = `
      INSERT INTO clientes (      
        nombre,
        telefono,
        direccion_calle,
        direccion_colonia,
        direccion_municipio,
        estado,      
        email
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
  
    const values = [    
      nombre,
      telefono,
      direccion_calle,
      direccion_colonia,
      direccion_municipio,
      estado,    
      email
    ];
  
    const result = await client.query(query, values);
    const cliente_id = result.rows[0].cliente_id;

    credito.cliente_id = cliente_id;
    const credito_id = await crearCreditoService(client, credito);

    await client.query('COMMIT');

    const data = {
      credito_id,
      cliente_id
    }

    return data;
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally{
    client.release();
  }

}

const obtenerClientesPaginadoService = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const totalQuery = 'SELECT COUNT(*) FROM clientes WHERE estado = true';
  const dataQuery = `
    SELECT *
    FROM clientes
    WHERE estado = true
    ORDER BY cliente_id
    LIMIT $1 OFFSET $2
  `;

  const [totalResult, dataResult] = await Promise.all([
    pool.query(totalQuery),
    pool.query(dataQuery, [limit, offset])
  ]);

  const total = parseInt(totalResult.rows[0].count, 10);
  const totalPages = Math.ceil(total / limit);

  return {
    data: dataResult.rows,
    meta: {
      total,
      totalPages,
      currentPage: page,
      perPage: limit
    }
  };
};

const actualizarClienteService = async (clienteId, datosActualizados) => {
  const {
    nombre,
    telefono,
    email,
    direccion_calle,
    direccion_colonia,
    direccion_municipio,
  } = datosActualizados;

  const query = `
    UPDATE clientes
    SET
      nombre = $1,
      telefono = $2,
      email = $3,
      direccion_calle = $4,
      direccion_colonia = $5,
      direccion_municipio = $6,
      fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE cliente_id = $7 AND estado = true
    RETURNING *;
  `;

  const values = [
    nombre,
    telefono,
    email,
    direccion_calle,
    direccion_colonia,
    direccion_municipio,
    clienteId
  ];

  const result = await pool.query(query, values);

  if (result.rowCount === 0) {
    throw new Error('Cliente no encontrado o inactivo');
  }

  return result.rows[0];
};


const desactivarClienteService = async (clienteId) => {
  const query = `
    UPDATE clientes
    SET estado = false,
        fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE cliente_id = $1
    RETURNING *;
  `;

  const result = await pool.query(query, [clienteId]);

  if (result.rowCount === 0) {
    throw new Error('Cliente no encontrado');
  }

  return result.rows[0];
};

const buscarClientesService = async (termino) => {
  const query = `
    SELECT *
    FROM clientes
    WHERE estado = true AND (
      nombre ILIKE $1 OR
      telefono ILIKE $1 OR
      email ILIKE $1
    )
    ORDER BY fecha_actualizacion DESC
  `;

  const searchValue = `%${termino}%`;

  const result = await pool.query(query, [searchValue]);

  return result.rows;
};

module.exports = {
  existeClienteService,
  crearClienteService,
  obtenerClientesPaginadoService,
  actualizarClienteService,
  desactivarClienteService,
  buscarClientesService
};
