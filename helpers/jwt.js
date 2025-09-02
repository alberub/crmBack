const jwt = require('jsonwebtoken');
const User = require('../models/user');

const generarJWT = ( uid ) => {

    return new Promise ( (resolve, reject ) => {

        const payload = {
            uid
        };
    
        jwt.sign( payload, process.env.JWT_SECRET,{
            expiresIn: '12h'
        }, (err, token) => {
    
            if(err){
                reject(token);
            } else {
                resolve(token);
            }
    
        });
        
    });

};

const comprobarJWT = async( token = '' ) => {

    try {
        
        if (token.length < 10 ) {
            return null;
        }

        const { uid } = jwt.verify( token, process.env.JWT_SECRET );
        const user = await User.findById( uid );

        if ( user ) {        
            return user;
        } else {            
            return null;
        }

    } catch (error) {
        return null;
    }

}

module.exports = {
    generarJWT,
    comprobarJWT
}