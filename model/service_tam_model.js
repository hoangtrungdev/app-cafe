var mongoose = require('mongoose');
module.exports  = mongoose.model('service_tam', {
    hd_id : String,
    code : String,
    value : String

})