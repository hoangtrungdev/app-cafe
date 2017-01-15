module.exports = function(app) {
    var mongoose = require('mongoose');
    var Store  = require('../model/store_model.js') ;
    var Service_store  = require('../model/service_store_model.js') ;
	// api ---------------------------------------------------------------------
	// get all stores
	app.get('/api/stores', function(req, res) {
		// use mongoose to get all stores in the database
		Store.find(function(err, stores) {
			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err)
			res.json(stores); // return all stores in JSON format
		});
	});
    app.get('/api/get_stores/:store_id', function(req, res) {
        Store.findOne({
            _id : req.params.store_id
        }, function(err, store) {
            res.json(store);
        });
    });
	// create store and send back all stores after creation
	app.post('/api/stores', function(req, res) {
		// create a store, information comes from AJAX request from Angular
		Store.create({
            code : req.body.code,
            name : req.body.name,
            date : req.body.date,
            user : req.body.user,
            note : req.body.note
        }, function(err) {
			if (err)
				res.send(err);
            Store.find(function(err, stores) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err)
                res.json(stores); // return all stores in JSON format
            });
		});
	});

    app.post('/api/update_stores', function(req, res) {
        Store.findOne({_id: req.body.id}, function(error, store){
            if(error){
                res.json(error);
            }
            else if(store == null){
                res.json('no such sevice!')
            }
            else{
                store[req.body.key] = req.body.value;
                store.save( function(error){
                    if(error){
                        res.json(error);
                    }
                    Store.find(function(err, stores) {
                        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                        if (err)
                            res.send(err)
                        res.json(stores); // return all stores in JSON format
                    });
                });
            }
        });

    });

	// delete a store
    app.delete('/api/stores/:store_id', function(req, res) {
        Store.remove({
            _id : req.params.store_id
        }, function(err, store) {
            if (err)
                res.send(err);
            Store.find(function(err, stores) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err)
                res.json(stores); // return all stores in JSON format
            });
        });
    });

    //--------------------------------------
    // create store and send back all stores after creation
    app.get('/api/services_store', function(req, res) {
        // use mongoose to get all stores in the database
        Service_store.find(function(err, stores) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)
            res.json(stores); // return all stores in JSON format
        });
    });
    app.post('/api/get_services_store', function(req, res) {
        Service_store.findOne({
            code : req.body.code ,
            store_id : req.body.store_id
        }, function(err, ser) {
            res.json(ser);
        });
    });
    app.delete('/api/services_store/:service_id', function(req, res) {
        Service_store.remove({
            _id : req.params.service_id
        }, function(err, service) {
            if (err)
                res.send(err);
                res.json(service);
        });
    });
    app.post('/api/update_services_store', function(req, res) {

        Service_store.findOne({_id: req.body.id}, function(error, service){
                service[req.body.key] = req.body.value;
                service.save( function(error, data){
                    if(error){
                        res.json(error);
                    }
                    Service_store.find(function(err, services) {
                        if (err)
                            res.send(err)
                        res.json(services);
                    });
                });
        });

    });
    app.post('/api/services_store', function(req, res) {
        // create a store, information comes from AJAX request from Angular
        Service_store.create(req.body.data, function(err) {
            if (err)
                res.send(err);
            Store.find(function(err, stores) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err)
                res.json(stores); // return all stores in JSON format
            });
        });
    });

};