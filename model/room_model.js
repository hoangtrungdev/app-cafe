var mongoose = require('mongoose');
module.exports  = mongoose.model('rooms',{
    name : String,
    time : String,
    top : String,
    left : String,
    paid : String,
    extra : String,
    reduce : String,
    vat : Boolean,
    print : Boolean,
    note : String,
    status : Boolean,
    bill : Array,
    join_array : Array,
    parent : Object,
    coupon : Object,
    customer : Object,
    user : Object,
    floor_id : String
})