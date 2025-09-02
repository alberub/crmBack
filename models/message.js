// const { Schema, model } = require('mongoose');

// const MessageSchema = Schema({
//     message:{
//         type: String,
//         required: true
//     },
//     from:{
//         type: Schema.Types.ObjectId,
//         ref:'User',
//         required: true
//     },
//     createdAt:{
//         type: Date,
//         default: Date.now
//     },
//     readed:{
//         type: Boolean,
//         default: false
//     },

// });

// MessageSchema.method('toJSON', function() {
//     const { __v, ...object } = this.toObject();

//     return object;
// })

// module.exports = model('Message', MessageSchema);