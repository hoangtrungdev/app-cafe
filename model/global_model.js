var mongoose = require('mongoose');
module.exports  = mongoose.model('globals',{
    key : String ,
    value : String
})