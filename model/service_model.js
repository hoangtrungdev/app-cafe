var mongoose = require('mongoose');
module.exports  = mongoose.model('services', {
    create : String,
    name : String,
    img : String,
    code : String,
    price : String,
    price_mua : String,
    price_chiphi : String,
    price_von : String,
    price_si : String,
    qty : Number ,
    sell : Number ,
    sell_tam : Number ,
    ncs : Array ,
    category : Object,
    status : String
})