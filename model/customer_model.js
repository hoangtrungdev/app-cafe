var mongoose = require('mongoose');
module.exports  = mongoose.model('customers', {
    name : String,
    code : String,
    email : String,
    phone : String,
    address : String
})