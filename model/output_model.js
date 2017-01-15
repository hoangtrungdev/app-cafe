var mongoose = require('mongoose');
module.exports  = mongoose.model('outputs', {
    code : String,
    name : String,
    detail : Array,
    user : {
        username : String,
        name : String ,
        address : String,
        email : String,
        phone : String,
        password : String,
        status : String,
        role : String
    },
    date : String,
    note : String
})