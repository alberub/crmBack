const { pool } = require('../database/config');
const { response } = require('express');


const ValidarAdmin = async( req, res = response , next ) => {

    const { gestorId } = req.body;

    try {
        
        const query = 'SELECT id FROM cat_gestores WHERE $1 IN ( 1, 2 )';
        const values = [gestorId]
        
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(401).json({
                ok: false,
                errorMessage: 'Sin autorización'
            });
        }

        next();

    } catch (error) {
        res.status(500).json({                
            ok:false,
            errorMessage:'Error inesperado, hable con el administrador'
        });
    }

}

module.exports = {
    ValidarAdmin
}