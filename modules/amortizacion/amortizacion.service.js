const { pool } = require('../../database/config');

async function generarYGuardarAmortizacion({
  credito_id,
  tasa_anual,
  plazo_anios,
  enganche,
  costo_total,
  anualidad,
  fecha_inicio,
  mes_anualidad,
  posponer_primera_anualidad
}) {
  const query = `
    SELECT generar_y_guardar_amortizacion(
      $1, $2, $3, $4, $5, $6, $7, $8, $9
    );
  `;

  const values = [
    credito_id,
    tasa_anual,
    plazo_anios,
    enganche,
    costo_total,
    anualidad,
    fecha_inicio,
    mes_anualidad,
    posponer_primera_anualidad
  ];

  try {
    await pool.query(query, values);
    return "Amortización generada y guardada exitosamente";
  } catch (error) {
    console.error('Error al ejecutar la función:', error);
    throw error;
  }
}

async function consultarAmortizacionConMora(cliente_id, credito_id) {

    const queryExists = 'SELECT * FROM clientes WHERE cliente_id = ($1)';
    const query = 'SELECT * FROM consultar_amortizacion_con_mora($1)';
    
    try {

        const exists = await pool.query(queryExists, [cliente_id]);

        if (exists.rows.length === 0) {
            throw new Error('El cliente no existe');            
        }
        const result = await pool.query(query, [credito_id]);
        return result.rows;
    } catch (error) {
        console.error('Error al consultar la amortización con mora:', error);
        throw error;
    }
}

module.exports = {
  generarYGuardarAmortizacion,
  consultarAmortizacionConMora
};
