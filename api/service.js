
module.exports = function(app) {
    var mongoose = require('mongoose');
    var Service  =   require('../model/service_model.js') ;
    var Service_tam  =   require('../model/service_tam_model.js') ;


    app.get('/api/service_tam', function(req, res) {
        // use mongoose to get all services in the database
        Service_tam.find(function(err, service_tam) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)
            res.json(service_tam); // return all services in JSON format
        });
    });
    app.post('/api/check_service_tam/', function(req, res) {
        Service_tam.findOne({code: req.body.code, hd_id: req.body.hd_id}, function(error, service){
            if (error)
                res.send(error);
            // get and return all the services after you create another
            res.json(service);
        });
    });
    app.post('/api/service_tam_all/', function(req, res) {
        Service_tam.find({code: req.body.code}, function(error, service){
            if (error)
                res.send(error);
            // get and return all the services after you create another
            res.json(service);
        });
    });
    app.post('/api/service_tam', function(req, res) {
        Service_tam.create( req.body.service_tam, function(err, service) {
            res.json(service);
        });
    });
    app.post('/api/update_service_tam', function(req, res) {
        Service_tam.findOne({code: req.body.code, hd_id: req.body.hd_id}, function(error, service){
            service['value'] = req.body.value;
            service.save( function(error, data){
                res.json(data);
            });
        });
    });
    app.delete('/api/del_service_tam/:_id', function(req, res) {
        Service_tam.remove({
            _id : req.params._id
        }, function(err, service) {
            res.json(service);
        });
    });
    app.delete('/api/service_tam/:hd_id', function(req, res) {
        Service_tam.remove({
            hd_id : req.params.hd_id
        }, function(err, service) {
            res.json(service);
        });
    });
    // api ---------------------------------------------------------------------
    // get all services
    app.get('/api/services', function(req, res) {
        // use mongoose to get all services in the database
        Service.find(function(err, services) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)
            res.json(services); // return all services in JSON format
        });
    });

    // create service and send back all services after creation
    app.post('/api/services', function(req, res) {
        // create a service, information comes from AJAX request from Angular
        Service.create({
            create : req.body.create,
            name : req.body.name,
            code : req.body.code,
            price : req.body.price,
            price_mua : req.body.price_mua,
            price_chiphi : req.body.price_chiphi,
            price_von : req.body.price_von,
            price_si : req.body.price_si,
            category : req.body.category,
            supplier : req.body.supplier,
            img : req.body.img,
            qty : req.body.qty,
            ncs : req.body.ncs,
            sell : 0 ,
            status : 'on'
        }, function(err, service) {
            if (err)
                res.send(err);
            // get and return all the services after you create another
            Service.find(function(err, services) {
                if (err)
                    res.send(err)
                res.json(services);
            });
        });
    });

    app.post('/api/update_services', function(req, res) {

        Service.findOne({_id: req.body.id}, function(error, service){
            if(error){
                res.json(error);
            }
            else if(service == null){
                res.json('no such sevice!')
            }
            else{
                service[req.body.key] = req.body.value;
                service.save( function(error, data){
                    if(error){
                        res.json(error);
                    }
                    Service.find(function(err, services) {
                        if (err)
                            res.send(err)
                        res.json(services);
                    });
                });
            }
        });

    });
    app.post('/api/service_add/', function(req, res) {
        Service.findOne({code: req.body.service.code}, function(error, ser_get){
            var set = {};
            if(req.body.service.nc){
                set['sell'] = ser_get.sell - req.body.service.qty_tra*req.body.service.nc.nc_qty;
            }else{
                set['sell'] = ser_get.sell - req.body.service.qty_tra;
            }
            Service.findOneAndUpdate({ code: req.body.service.code },
                {$set: set},
                function(error, service){
                    if(error){
                        res.json(error);
                    }else{
                        res.json(service);
                    }
                });
        });

    });
    app.post('/api/service_add_del/', function(req, res) {
        Service.findOne({code: req.body.service.code}, function(error, ser_get){
            if(ser_get){
                var set = {};
                if(req.body.service.nc){
                    set['sell'] = ser_get.sell*1 - req.body.service.qty*req.body.service.nc.nc_qty;
                }else{
                    set['sell'] = ser_get.sell*1 - req.body.service.qty*1;
                }
                Service.findOneAndUpdate({ code: req.body.service.code },
                    {$set: set},
                    function(error, service){
                        if(error){
                            res.json(error);
                        }else{
                            res.json(service);
                        }
                    });
            }
        });

    });
    app.post('/api/service_sell/', function(req, res) {
        Service.findOne({code: req.body.service.code}, function(error, ser_get){
            var set = {};
            if(req.body.service.nc){
                set['sell'] = ser_get.sell*1 + req.body.service.qty*req.body.service.nc.nc_qty;
            }else{
                set['sell'] = ser_get.sell*1 + req.body.service.qty*1;
            }
            Service.findOneAndUpdate({ code: req.body.service.code },
                {$set: set},
                function(error, service){
                    if(error){
                        res.json(error);
                    }else{
                        res.json(service);
                    }
                });
        });

    });
    app.get('/api/check_service/:code', function(req, res) {
        Service.findOne({code: req.params.code}, function(error, service){
            if (error)
                res.send(error);
            // get and return all the services after you create another
            res.json(service);
        });
    });
    // delete a service
    app.delete('/api/services/:service_id', function(req, res) {
        Service.remove({
            _id : req.params.service_id
        }, function(err, service) {
            if (err)
                res.send(err);
            // get and return all the services after you create another
            Service.find(function(err, services) {
                if (err)
                    res.send(err)
                res.json(services);
            });
        });
    });


};