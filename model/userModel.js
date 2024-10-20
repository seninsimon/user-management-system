const mongoose = require('mongoose')
const userSchema = mongoose.Schema({
    username: {
        type : String,
        required : true
    },
    password: {
        type : String,
        required : true
    },
    email: {
        type : String,
        required : true,
        unique : true
    },
    mobile : {
        type : Number,
        required : true
    }

})
module.exports = mongoose.model('User',userSchema);