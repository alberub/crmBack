const { response } = require( 'express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { generarJWT } = require('../helpers/jwt');
const { pool } = require('../database/config'); // Asegúrate de que la ruta es correcta

const login = async( req, res ) => {

    const { usuario, password } = req.body;

    try {

            // Verificar usuario
            const query = 'SELECT * FROM cat_gestores WHERE usuario = $1';
            const values = [usuario];

            const usuarioDB = await pool.query(query, values);
            if (usuarioDB.rows.length === 0) {
                return res.status(400).json({
                    ok: false,
                    errorMessage: 'El usuario y/o contraseña son incorrectos'
                });
            };

            //Validar password
            const esContraseñaValida = bcrypt.compareSync( password, usuarioDB.rows[0].password);

            if( !esContraseñaValida ) {
                return res.status(404).json({
                    ok: false,
                    errorMessage: 'El usuario y/o contraseña son incorrectos'
                });
            }
            
            // Generar JWT
            const token = await generarJWT( usuarioDB.rows[0].id );

            res.json({
                ok: true,                
                datos: token
            });
        
        } catch (error) {                        
            res.status(500).json({                
                ok:false,
                errorMessage:'Error inesperado, hable con el administrador'
            });
        }

}

const renewToken = async( req, res = response ) => {

    const uid = req.uid;

    // Generar JWT
    const token = await generarJWT( uid );

    const query = 'SELECT id, usuario FROM cat_gestores WHERE id = $1';
    const values = [ uid ];

    const result = await pool.query(query, values);
    const usuario = result.rows[0];

    res.json({
        ok: true,
        token,
        usuario
    });

}


module.exports = {
    login,    
    renewToken
}