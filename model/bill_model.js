var mongoose = require('mongoose');
module.exports  = mongoose.model('bills',{
    code : String,
    total : String,
    paid : String,
    extra : String,
    date : String,
    services: Array,
    customer : Object,
    user : Object

})