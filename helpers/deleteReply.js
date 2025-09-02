const res = require('express/lib/response');
const Tweet = require('../models/post');

const deleteReply = async( id ) => {

        try {

            const replyDelete = await Tweet.find({ "replies": { "$in": id } } );
            
            const deleteReply = replyDelete.replies.indexOf( id );
            replyDelete.replies.splice( deleteReply, 1 );
            
            await Tweet.findByIdAndUpdate( replyDelete._id, replyDelete, { new: true } );
            await Tweet.findByIdAndDelete(id);

            res.status(200).json({
                ok: true,
            })

        } catch (error) {

            res.status(500).json({
                ok: false,
                msg:'No es una respuesta'
            })

        }

}

module.exports = {
    deleteReply
}