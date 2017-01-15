var mongoose = require('mongoose');
module.exports  = mongoose.model('pbss',{
    code : String,
    total : String,
    total_mua : String,
    total_chiphi : String,
    paid : String,
    reduce : String,
    date : String,
    services: Array,
    customer : {
        name : String,
        code : String,
        email : String,
        phone : String,
        address : String
    },
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
    coupon: String

})