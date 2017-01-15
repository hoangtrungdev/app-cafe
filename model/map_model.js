var mongoose = require('mongoose');
module.exports  = mongoose.model('maps',{
    name : String,
    img : String,
    room: Array
})