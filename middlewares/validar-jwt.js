const jwt = require('jsonwebtoken');
const User = require('../models/user');

const validarJWT = ( req, res, next ) => {

    const token = req.header('x-token');

     if (!token){
         return res.status(401).json({
             ok: false,
             msg:'No hay token en la peticion'
         });
     }

     try {

        const { uid } = jwt.verify( token, process.env.JWT_SECRET );

        req.uid = uid;

        next();
         
     } catch (error) {

        return res.status(401).json({
            ok:false,
            errorMessage:'Token invalido'
        });
         
     }

}

module.exports = {
    validarJWT,
    // profilePrivacy
};