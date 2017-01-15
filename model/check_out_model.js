var mongoose = require('mongoose');
module.exports  = mongoose.model('check_outs',{
    code : String,
    total : Number,
    extra : Number,
    paid : Number,
    reduce_coupon : Number,
    reduce : Number,
    vat : Boolean,
    deleted : Boolean,
    deleted_yeucau : Boolean,
    reason : String,
    reason_yeucau : String,
    user_yeucau : Object,
    date_yeucau : String,
    date : String,
    note : String,
    services: Array,
    join_array : Array,
    customer : Object ,
    user : Object,
    user_add : Object,
    coupon: String

})