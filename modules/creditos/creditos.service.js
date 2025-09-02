const { pool } = require('../../database/config');

async function crearCreditoService(client, data) {
  
  const {
    cliente_id,
    fecha_inicio,
    plazo_meses,
    tasa_anual,
    enganche,
    costo_terreno,
    lote,
    manzana,
    id_campestre,
    posponer_primera_anualidad,
    mes_anualidad,
    anualidad,
    precio_metro
  } = data;

  // 1. Verificar existencia del cliente
  const clienteExiste = await client.query(
    'SELECT 1 FROM clientes WHERE cliente_id = $1',
    [cliente_id]
  );

  if (clienteExiste.rowCount === 0) {
    throw new Error('Cliente no encontrado');
  }

  const area = costo_terreno / precio_metro;

  // 2. Insertar crédito
  const insertQuery = `
    INSERT INTO creditos (
      cliente_id, fecha_inicio, plazo_meses, tasa_anual,
      enganche, costo_terreno, lote, manzana, status, id_campestre, precio_metro, area
    ) VALUES (
      $1, $2, $3, $4,
      $5, $6, $7, $8, 1, $9, $10, $11
    ) RETURNING credito_id
  `;

  const result = await client.query(insertQuery, [
    cliente_id,
    fecha_inicio,
    plazo_meses,
    tasa_anual,
    enganche,
    costo_terreno,
    lote,
    manzana,
    id_campestre,
    precio_metro,
    area
  ]);

  const credito_id = result.rows[0].credito_id;

  await generarAmortizacion(client, {
    credito_id,
    tasa_anual,
    plazo_meses,
    enganche,
    anualidad,
    costo_total: costo_terreno,
    fecha_inicio,
    mes_anualidad,
    posponer_primera_anualidad
  });
  
  const saldoInicial = costo_terreno - enganche;

  const queryMensualidad = `
    SELECT mensual, fecha_pago
    FROM amortizacion_credito
    WHERE credito_id = $1 AND numero_pago = $2;
  `;

  const { rows } = await client.query(queryMensualidad, [credito_id, 1]);

  if (rows.length === 0){
    throw new Error('Ha ocurrido un error al calcular el saldo inicial del crédito');
  }  
  
  const { mensual, fecha_pago } = rows[0];
  const queryDetalleCredito = `
    INSERT INTO detalle_credito (
      credito_id,
      mensualidad,
      saldo_restante,
      pagos_realizados,
      pagos_vencidos,      
      adeudo,
      proximo_pago,
      estado
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;

  await client.query(queryDetalleCredito, [
    credito_id,
    mensual,
    saldoInicial,
    0,
    0,
    0,
    fecha_pago,
    1
  ])

  return result.rows[0].credito_id;
}

async function generarAmortizacion(client, {
    credito_id,
    tasa_anual,
    plazo_meses,
    enganche,
    anualidad,
    costo_total,
    fecha_inicio,
    mes_anualidad,
    posponer_primera_anualidad = false
}) {
   
  await client.query(
    `SELECT generar_y_guardar_amortizacion(
      $1, $2, $3, $4, $5, $6, $7, $8, $9
    )`,
    [
      credito_id,
      tasa_anual,
      plazo_meses,
      enganche,
      costo_total,
      anualidad,
      fecha_inicio,
      mes_anualidad,
      posponer_primera_anualidad
    ]
  );
}

async function  obtenerCreditosPaginadoService(idCampestre, page = 1, limit = 10) {
  const offset = (page - 1) * limit;

  // Contar con lógica “0 = todos”
  const totalQuery = `
    SELECT COUNT(*) AS count
    FROM creditos
    WHERE status = 1
      AND ($1 = 0 OR id_campestre = $1)
  `;

  // Traer datos con misma lógica
  const dataQuery = `
    SELECT
      c.*,
      cli.nombre       AS nombre_cliente,
      d.saldo_restante,
      d.mensualidad,
      d.ultimo_pago
    FROM creditos c
    LEFT JOIN detalle_credito d
      ON d.credito_id = c.credito_id
    LEFT JOIN clientes cli
      ON cli.cliente_id = c.cliente_id
    WHERE c.status = 1
      AND ($1 = 0 OR c.id_campestre = $1)
    ORDER BY c.credito_id
    LIMIT $2 OFFSET $3
  `;


  const [totalResult, dataResult] = await Promise.all([
    pool.query(totalQuery, [idCampestre]),
    pool.query(dataQuery, [idCampestre, limit, offset])
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

async function obtenerDetalleCreditoService(creditoId) {
  const result = await pool.query(`SELECT * FROM obtener_amortizacion_con_pagos($1)`, [creditoId]);

  return result.rows;
}

async function obtenerCreditoCompletoService(creditoId) {
  const query = `
    SELECT *
    FROM public.obtener_credito_completo($1)
  `;
  const { rows } = await pool.query(query, [creditoId]);
  // la función devuelve exactamente una fila o ninguna
  return rows[0] || null;
};

/**
 * Llama a la función PL/pgSQL para simular la amortización con adelanto
 * @param {Object} params
 * @param {number} params.creditoId
 * @param {number} params.tasaAnual
 * @param {number} params.plazoAnios
 * @param {number} params.enganche
 * @param {number} params.costoTotal
 * @param {number} params.anualidad
 * @param {string} params.fechaInicio      ISO Date string
 * @param {number} params.mesAnualidad     (1–12)
 * @param {boolean} params.posponerPrimeraAnualidad
 * @param {string|null} params.fechaAdelanto ISO Date string or null
 * @param {number} params.montoAdelanto
 * @returns {Promise<Array>} Array de filas simuladas
 */
async function simularAmortizacion({
  creditoId,
  tasaAnual,
  plazoAnios,
  enganche,
  costoTotal,
  anualidad,
  fechaInicio,
  mesAnualidad,
  posponerPrimeraAnualidad,
  fechaAdelanto,
  montoAdelanto
}) {
  const sql = `
    SELECT *
      FROM public.simular_amortizacion_con_adelanto(
        $1::integer,
        $2::numeric,
        $3::integer,
        $4::numeric,
        $5::numeric,
        $6::numeric,
        $7::date,
        $8::integer,
        $9::boolean,
        $10::date,
        $11::numeric
      )
    ORDER BY numero_pago;
  `;
  const vals = [
    creditoId,
    tasaAnual,
    plazoAnios,
    enganche,
    costoTotal,
    anualidad,
    fechaInicio,
    mesAnualidad,
    posponerPrimeraAnualidad,
    fechaAdelanto,
    montoAdelanto
  ];
  const { rows } = await pool.query(sql, vals);
  return rows;
}

module.exports = { simularAmortizacion };


module.exports = {
  crearCreditoService,
  obtenerCreditosPaginadoService,
  obtenerDetalleCreditoService,
  obtenerCreditoCompletoService
};
