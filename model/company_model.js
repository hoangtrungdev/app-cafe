var mongoose = require('mongoose');
module.exports  = mongoose.model('companys', {
    company : String,
    vat : String,
    mst : String
})