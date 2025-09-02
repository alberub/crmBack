const { pool } = require('../../database/config');

async function crearPagoService(data) {

    const { credito_id, monto, fecha } =  data;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const creditoExiste = await client.query(
            'SELECT 1 FROM creditos WHERE credito_id = $1 AND status = 1',
            [credito_id]
        );

        if (creditoExiste.rowCount === 0) {
            throw new Error('El crédito no existe o esta inactivo');
        }

        await client.query(`
            SELECT registrar_pago($1, $2, $3)`,
            [credito_id, monto, fecha]
        );

        const detalleCredito = await client.query(`
            SELECT * FROM detalle_credito WHERE credito_id = $1`,  [credito_id]);

        if (detalleCredito.rowCount === 0) {
            throw new Error('Hubo un error al insertar en detalle crédito');
        }

        await client.query('COMMIT');
        console.log(detalleCredito);
        
        return detalleCredito.rows[0];

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally{
        client.release();
    }
}

module.exports = {
    crearPagoService
};