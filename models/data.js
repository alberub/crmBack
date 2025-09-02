// const { Schema, model } = require('mongoose');

// const DataSchema = Schema({
//     userId: {
//         type: Schema.Types.ObjectId,
//         ref:'User',
//         required: true
//     },
//     all: [{
//         type: Schema.Types.ObjectId,
//         ref:'Tweet'
//     }],
//     bookmark:[{
//         type: Schema.Types.ObjectId,
//         ref:'Tweet'
//     }],
//     subscribers:[{
//         type: Schema.Types.ObjectId,
//         ref: 'User'
//     }]
// });

// DataSchema.method('toJSON', function() {
//     const { __v, ...object } = this.toObject();

//     return object;
// })

// module.exports = model('Data', DataSchema);