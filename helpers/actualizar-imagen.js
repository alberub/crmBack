const fs = require('fs');

const User = require('../models/user');
const Tweet = require('../models/post');
const res = require('express/lib/response');

const cloudinary = require('cloudinary').v2
cloudinary.config( process.env.CLOUDINARY_URL ); 

const borrarImagen = ( path ) => {

   if( fs.existsSync( path )) {
       fs.unlinkSync( path );
   }

}

// const actualizarImagen = async( tipo, id, nombreArchivo ) => {

//     let pathViejo = '';

//     switch ( tipo ) {

//         case 'tweets':

//                 const tweet = await Tweet.findById(id);
//                 if( !tweet ) {
//                     return false;
//                 }

//                 pathViejo = `./uploads/tweets/${ tweet.img }`;
//                 borrarImagen( pathViejo );

//                 tweet.img = nombreArchivo;
//                 await tweet.save();
//                 return true;
        
//             break;

//         case 'users':

//                 const user = await User.findById(id);
//                 if( !user ) {
//                     return false;
//                 }

//                 pathViejo = `./uploads/users/${ user.img }`;
//                 borrarImagen( pathViejo );

//                 user.img = nombreArchivo;
//                 await user.save();
//                 return true;
        
//             break;

//         case 'usersP':

//                 const userPort = await User.findById(id);
//                 if( !userPort ) {
//                     return res.status(400).json({
//                         msg:'No existe id en los parametros'
//                     });
//                 }

//                 pathViejo = `./uploads/usersP/${ userPort.imgPort }`;
//                 borrarImagen( pathViejo );

//                 userPort.imgPort = nombreArchivo;
//                 await userPort.save();
//                 return true;
        
//             break;

//             default:
//                 return res.status(400).json({
//                     ok: false,
//                     msg: 'ha ocurrido un error',
//                 });
    
//     }

// }

const actualizarImagen = async( tipo, id, tempFilePath ) => {

    switch ( tipo ) {

        case 'tweets':

                const tweet = await Tweet.findById(id);
                if( !tweet ) {
                    return false;
                }

                if ( tweet.img ) {
                    const nameArr = tweet.img.split('/');
                    const name = nameArr[ nameArr.length -1 ];
                    const [ public_id ] = name.split('.');
                    cloudinary.uploader.destroy( public_id );
                }

                var { secure_url } = await cloudinary.uploader.upload( tempFilePath );

                tweet.img = secure_url;
                await tweet.save();
                return true;
        
            break;

        case 'users':

                const user = await User.findById(id);
                if( !user ) {
                    return false;
                }

                if ( user.img ) {
                    const nameArr = user.img.split('/');
                    const name = nameArr[ nameArr.length -1 ];
                    const [ public_id ] = name.split('.');
                    cloudinary.uploader.destroy( public_id );
                }

                var { secure_url } = await cloudinary.uploader.upload( tempFilePath );

                user.img = secure_url;
                await user.save();
                return true;
        
            break;

        case 'usersP':

                const userPort = await User.findById(id);
                if( !userPort ) {
                    return res.status(400).json({
                        msg:'No existe id en los parametros'
                    });
                }

                if ( user.imgPort ) {
                    const nameArr = user.imgPort.split('/');
                    const name = nameArr[ nameArr.length -1 ];
                    const [ public_id ] = name.split('.');
                    cloudinary.uploader.destroy( public_id );
                }

                var { secure_url } = await cloudinary.uploader.upload( tempFilePath );

                userPort.imgPort = secure_url;
                await userPort.save();
                return res.json({
                    msg: 'File uploaded',
                    nombreArchivo: secure_url
                });
        
            break;

            default:
                return res.status(400).json({
                    ok: false,
                    msg: 'ha ocurrido un error',
                });
    
    }

}


module.exports = {
    actualizarImagen
}