var mongoose = require('mongoose');
module.exports  = mongoose.model('categorys', {
    code : String,
    type : String,
    img : String,
    name : String
})