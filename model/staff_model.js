var mongoose = require('mongoose');
module.exports  = mongoose.model('staffs', {
    username : String,
    name : String ,
    address : String,
    email : String,
    phone : String,
    password : String,
    status : String,
    img : String,
    created : String,
    updated : String,
    role : String
})