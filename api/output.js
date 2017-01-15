module.exports = function(app) {
    var mongoose = require('mongoose');
    var Output  = require('../model/output_model.js') ;
    var Service_output  = require('../model/service_output_model.js') ;
	// api ---------------------------------------------------------------------
	// get all outputs
	app.get('/api/outputs', function(req, res) {
		// use mongoose to get all outputs in the database
		Output.find(function(err, outputs) {
			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err)
			res.json(outputs); // return all outputs in JSON format
		});
	});
    app.get('/api/get_outputs/:output_id', function(req, res) {
        Output.findOne({
            _id : req.params.output_id
        }, function(err, output) {
            res.json(output);
        });
    });
	// create output and send back all outputs after creation
	app.post('/api/outputs', function(req, res) {
		// create a output, information comes from AJAX request from Angular
		Output.create({
            code : req.body.code,
            name : req.body.name,
            date : req.body.date,
            user : req.body.user,
            note : req.body.note
        }, function(err) {
			if (err)
				res.send(err);
            Output.find(function(err, outputs) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err)
                res.json(outputs); // return all outputs in JSON format
            });
		});
	});

    app.post('/api/update_outputs', function(req, res) {
        Output.findOne({_id: req.body.id}, function(error, output){
            if(error){
                res.json(error);
            }
            else if(output == null){
                res.json('no such sevice!')
            }
            else{
                output[req.body.key] = req.body.value;
                output.save( function(error){
                    if(error){
                        res.json(error);
                    }
                    Output.find(function(err, outputs) {
                        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                        if (err)
                            res.send(err)
                        res.json(outputs); // return all outputs in JSON format
                    });
                });
            }
        });

    });

	// delete a output
    app.delete('/api/outputs/:output_id', function(req, res) {
        Output.remove({
            _id : req.params.output_id
        }, function(err, output) {
            if (err)
                res.send(err);
            Output.find(function(err, outputs) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err)
                res.json(outputs); // return all outputs in JSON format
            });
        });
    });

    //--------------------------------------
    // create output and send back all outputs after creation
    app.get('/api/services_output', function(req, res) {
        // use mongoose to get all outputs in the database
        Service_output.find(function(err, outputs) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)
            res.json(outputs); // return all outputs in JSON format
        });
    });
    app.post('/api/get_services_output', function(req, res) {
        Service_output.findOne({
            code : req.body.code ,
            output_id : req.body.output_id
        }, function(err, ser) {
            res.json(ser);
        });
    });
    app.delete('/api/services_output/:service_id', function(req, res) {
        Service_output.remove({
            _id : req.params.service_id
        }, function(err, service) {
            if (err)
                res.send(err);
                res.json(service);
        });
    });
    app.post('/api/update_services_output', function(req, res) {

        Service_output.findOne({_id: req.body.id}, function(error, service){
                service[req.body.key] = req.body.value;
                service.save( function(error, data){
                    if(error){
                        res.json(error);
                    }
                    Service_output.find(function(err, services) {
                        if (err)
                            res.send(err)
                        res.json(services);
                    });
                });
        });

    });
    app.post('/api/services_output', function(req, res) {
        // create a output, information comes from AJAX request from Angular
        Service_output.create(req.body.data, function(err) {
            if (err)
                res.send(err);
            Output.find(function(err, outputs) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err)
                res.json(outputs); // return all outputs in JSON format
            });
        });
    });

};