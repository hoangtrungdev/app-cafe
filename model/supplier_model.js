var mongoose = require('mongoose');
module.exports  = mongoose.model('suppliers', {
    code : String,
    name : String,
    address : String,
    email : String,
    phone : String
})