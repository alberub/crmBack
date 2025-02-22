const bcrypt = require('bcryptjs');
const { response } = require('express');
const { generarJWT } = require('../helpers/jwt');
const { pool } = require('../database/config');
const Usuario  = require('../models/usuario');
const { validarComplejidadContrasenia } = require('../helpers/validar-password');

const crearUsuario = async (req, res) => {

    const { usuario, password } = req.body;

    try {

        const resultadoValidacion = validarComplejidadContrasenia(password);
        if (!resultadoValidacion.esValida) {
            return res.status(400).json({
                ok: false,
                errorMessage: resultadoValidacion.errores
            })
        }

        const usuarioMin = usuario.toLowerCase();
        const query = 'SELECT EXISTS ( SELECT 1 FROM cat_gestores WHERE usuario = $1) AS existe;';
        const values = [usuarioMin];

        const existeUsuario = await pool.query(query, values);
        if (existeUsuario.rows[0].existe) {
            return res.status(400).json({
                ok: false,
                errorMessage: 'El nombre de usuario no se encuentra disponible.'
            });
        };

        const nuevoUsuario = new Usuario(usuarioMin, password);

        const salt = bcrypt.genSaltSync();
        nuevoUsuario.password = bcrypt.hashSync( password, salt );

        const queryNew = 'INSERT INTO cat_gestores(usuario, password) values($1, $2) RETURNING usuario';
        const valuesNew = [ nuevoUsuario.usuario, nuevoUsuario.password ];

        const resultado = await pool.query(queryNew, valuesNew);

        res.json({
            ok: true,
            datos: `Se ha creado el usuario ${resultado.rows[0].usuario}`
        })
        
    } catch (error) {
        res.json({
            ok: false,
            errorMessage: error.message
        })
    }

}

const obtenerUsuarios = async(req, res) => {

    try {
        
        const query = 'SELECT id, usuario, fecha_creacion FROM cat_gestores';
        const result = await pool.query(query);

        res.json({
            ok: true,
            datos: result.rows
        })

    } catch (error) {
        res.json({
            ok: false,
            errorMessage: error.message
        })
    }



}

const esAdmin = async(req, res) => {

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

        res.json({
            ok: true
        })

    } catch (error) {
        res.status(500).json({                
            ok:false,
            errorMessage:'Error inesperado, hable con el administrador'
        });
    }

}

const rutas = async(req, res) => {

    try {

        const query = 'SELECT * FROM cat_rutas';
        const rutas = await pool.query(query);

        res.json({
            ok: true,
            datos: rutas.rows
        })
        
    } catch (error) {
        res.status(500).json({                
            ok:false,
            errorMessage:'Error inesperado, hable con el administrador'
        });
    }

}

module.exports = {
    crearUsuario,
    obtenerUsuarios,
    esAdmin,
    rutas
}