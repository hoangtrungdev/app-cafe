
module.exports = function(app) {
    var mongoose = require('mongoose');

    var Map  =  require('../model/map_model.js')
    var Check_out  =  require('../model/check_out_model.js')
    var Return  =  require('../model/return_model.js')
    var Pbs  =  require('../model/pbs_model.js')
    var Bill  =  require('../model/bill_model.js')
    var Room_type  =  require('../model/category_model.js');
    var Global  =  require('../model/global_model.js');
    var Service  =   require('../model/service_model.js') ;
    var Customer  = require('../model/customer_model.js') ;

    app.get('/api/globals', function(req, res) {
        Global.find( function(error, global){
            if (error)
                res.send(error)
            res.json(global);
        });
    });
    app.post('/api/update_config', function(req, res) {
        var set = {};
        set['value'] = req.body.value;
        Global.findOneAndUpdate({ key: req.body.key },
            {$set: set},
            function(error, global){
                if(error){
                    res.json(error);
                    console.log(error)
                }else{
                    res.json(global);
                }
            });

    });

    app.post('/api/update_checkouts', function(req, res) {
        var set = {};
        set['total_mua'] = req.body.total_mua;
        set['total_chiphi'] = req.body.total_chiphi;
        Check_out.findOneAndUpdate({ _id: req.body._id },
            {$set: set},
            function(error, checkout){
                res.json(checkout);
            });

    });
    //-----------------------------------
    app.get('/api/checkouts', function(req, res) {
        // use mongoose to get all maps in the database
        Check_out.find(function(err, check_out) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)
            res.json(check_out); // return all maps in JSON format
        });
    });
    app.delete('/api/checkouts/:checkout_id', function(req, res) {
        Check_out.remove({
            _id : req.params.checkout_id
        }, function(err, check_outs) {
            if (err)
                res.send(err);
            Check_out.find(function(err, check_out) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err)
                res.json(check_out); // return all maps in JSON format
            });
        });
    });
    app.get('/api/get_checkouts/:checkout_id', function(req, res) {
        Check_out.findOne({
            _id : req.params.checkout_id
        }, function(err, check_out) {
            res.json(check_out);
        });
    });
    app.post('/api/check_out', function(req, res) {
        Check_out.create(req.body.bill, function(err, map) {
            if (err)
                res.send(err);
            res.json(map);
        });
    });
    app.post('/api/update_checkout', function(req, res) {
        Check_out.findOne({_id: req.body.id}, function(error, check){
           if(check == null){
                res.json('no such sevice!')
            }
           else{
               check[req.body.key] = req.body.value;
               check.save( function(error, data){
                        res.json(data);
                });
            }
        });

    });
    app.get('/api/returns', function(req, res) {
        Return.find(function(err, ret) {
            if (err)
                res.send(err)
            res.json(ret); // return all maps in JSON format
        });
    });
    app.post('/api/return', function(req, res) {
        Return.create(req.body.bill, function(err, ret) {
            if (err)
                res.send(err);
            res.json(ret);
        });
    });
    app.delete('/api/returns/:returns_id', function(req, res) {
        Return.remove({
            _id : req.params.returns_id
        }, function(err, ret) {
            if (err)
                res.send(err);
                res.json(ret);
        });
    });
    //-----------------------------------
    app.get('/api/pbss', function(req, res) {
        // use mongoose to get all maps in the database
        Pbs.find(function(err, check_out) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)
            res.json(check_out); // return all maps in JSON format
        });
    });
    app.delete('/api/pbss/:pbs_id', function(req, res) {
        Pbs.remove({
            _id : req.params.pbs_id
        }, function(err, check_outs) {
            if (err)
                res.send(err);
            Check_out.find(function(err, check_out) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err)
                res.json(check_out); // return all maps in JSON format
            });
        });
    });
    app.post('/api/pbs', function(req, res) {
        Pbs.create(req.body.bill, function(err, map) {
            if (err)
                res.send(err);
            res.json(map);
        });
    });

    app.get('/api/server_time', function(req, res) {
        time =  new Date().getTime();
        res.json(time);
    });


    app.get('/api/bills', function(req, res) {
        // use mongoose to get all maps in the database
        Bill.find(function(err, bill) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)
            res.json(bill); // return all maps in JSON format
        });
    });

    app.post('/api/bill', function(req, res) {
        Bill.create(req.body.bill, function(err, map) {
            if (err)
                res.send(err);
            res.json(map);
        });
    });
    app.delete('/api/bills/:bill_id', function(req, res) {
        Bill.remove({
            _id : req.params.bill_id
        }, function(err, bills) {
            if (err)
                res.send(err);
            res.json(bill); // return all maps in JSON format

        });
    });
};