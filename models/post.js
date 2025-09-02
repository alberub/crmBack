// const { Schema, model } = require('mongoose');

// const TweetSchema = Schema({

//     message: {
//         type: String,
//         maxlength: 280,
//         required: true
//     },
//     img:{
//         type: String
//     },
//     reply:{
//         type: Boolean,
//         default: false
//     },
//     replyTo:{
//         type: String,
//         default: false
//     },
//     liked:{
//         type: Boolean,
//         default: false
//     },
//     userId: {
//         type: Schema.Types.ObjectId,
//         ref:"User",
//         required: true
//     },
//     replies: [{
//         type: Schema.Types.ObjectId,
//         ref: "Tweet"
//     }],
//     likes:[{
//         type: Schema.Types.ObjectId,
//         ref:"User"
//     }],
//     retweets:[{
//         type: Schema.Types.ObjectId,
//         ref:"User"
//     }],
//     createdAt: { 
//         type: Date,
//         default: Date.now
//     },
//     poll:{
//         type: Boolean,
//         default: false
//     },
//     option1:{
//         "choice": String,
//         "vote": Number,
//         "userVotes":[{
//             type: Schema.Types.ObjectId,
//             ref:"User"
//         }]  
//     },
//     option2:{
//         "choice2": String,
//         "vote": Number,
//         "userVotes":[{
//             type: Schema.Types.ObjectId,
//             ref:"User"
//         }]   
//     },
//     expire: {
//         type: Number
//     }
    
// });

// TweetSchema.method('toJSON', function() {
//     const { __v, ...object } = this.toObject();

//     return object;
// })

// module.exports = model('Tweet', TweetSchema);