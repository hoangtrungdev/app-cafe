var mongoose = require('mongoose');
module.exports  = mongoose.model('coupons', {
    code : String,
    start : String ,
    end : String,
    type : String,
    value : String,
    status : String
})