// const { Schema, model } = require('mongoose');

// const NotificationSchema = Schema({
//     userId: {
//         type: Schema.Types.ObjectId,
//         ref:'User',
//         required: true
//     },
//     tweetOwner:{
//         type: Schema.Types.ObjectId,
//         ref:'User',
//         required: true
//     },
//     reaction:{
//         type: String,
//         required: true
//     },
//     tweet:{
//         type: Schema.Types.ObjectId,
//         ref:'Tweet',
//         required: true
//     },
//     viewed:{
//         type: Boolean,
//         default: false
//     }
// });

// NotificationSchema.method('toJSON', function() {
//     const { __v, ...object } = this.toObject();

//     return object;
// })

// module.exports = model('Notify', NotificationSchema);