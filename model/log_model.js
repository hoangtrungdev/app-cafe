var mongoose = require('mongoose');
module.exports  = mongoose.model('logs', {
    active : String,
    time : String,
    type : String,
    user : String
})