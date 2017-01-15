var mongoose = require('mongoose');
module.exports  = mongoose.model('services_store', {
    create : String,
    name : String,
    img : String,
    code : String,
    price : Number,
    qty : Number ,
    price_extra : Number ,
    ncs : Array ,
    supplier : {
        code : String,
        name : String,
        address : String,
        email : String,
        phone : String
    } ,
    category :  {
        code : String,
        name : String
    } ,
    status : String ,
    dvt : String ,
    store_name : String,
    store_date : String,
    store_id : String
})