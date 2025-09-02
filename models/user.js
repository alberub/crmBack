// const { Schema, model } = require('mongoose');

// const UserSchema = Schema({

//     firstName: {
//         type: String,
//         required: true
//     },
//     lastName:{
//         type: String
//     },
//     username:{
//         type: String,
//         required: true,
//         unique: true
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     password: {
//         type: String,
//         required: true
//     },
//     bio:{
//         type: String
//     },
//     location:{
//         type: String
//     },
//     website:{
//         type: String
//     },
//     img: { 
//         type: String
//     },
//     imgPort:{
//         type: String
//     },
//     createdAt:{
//         type: Date,
//         default: new Date()
//     },
//     followers:[{
//         type: Schema.Types.ObjectId,
//         ref:"User"
//     }],
//     followings:[{
//         type: Schema.Types.ObjectId,
//         ref:"User"
//     }],
//     privacity: {
//         type: String,
//         default: 'public'
//     }

// });

// UserSchema.method('toJSON', function() {
//     const { __v, _id, password, ...object } = this.toObject();

//     object.uid = _id;
//     return object;
// })

// module.exports = model('User', UserSchema);