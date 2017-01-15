
module.exports = function(app) {
    var mongoose = require('mongoose');
    var Log  =   require('../model/log_model.js') ;

    // api ---------------------------------------------------------------------
	// get all logs
	app.get('/api/logs', function(req, res) {
		// use mongoose to get all logs in the database
		Log.find(function(err, logs) {
			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err)
			res.json(logs); // return all logs in JSON format
		});
	});

	// create log and send back all logs after creation
    app.post('/api/logs', function(req, res) {
        // create a customer, information comes from AJAX request from Angular
        Log.create({
            active : req.body.active,
            time : req.body.time,
            type : req.body.type,
            user : req.body.user
        }, function(err) {
            if (err)
                res.send(err);
            Log.find(function(err, logs) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err)
                res.json(logs); // return all logs in JSON format
            });
        });
    });

    app.post('/api/update_logs', function(req, res) {

        Log.findOne({_id: req.body.id}, function(error, log){
            if(error){
                res.json(error);
            }
            else if(log == null){
                res.json('no such sevice!')
            }
            else{
                log[req.body.key] = req.body.value;
                log.save( function(error, data){
                    if(error){
                        res.json(error);
                    }
                    Log.find(function(err, logs) {
                        if (err)
                            res.send(err)
                        res.json(logs);
                    });
                });
            }
        });

    });

	// delete a log
    app.delete('/api/logs/:log_id', function(req, res) {
        Log.remove({
            _id : req.params.log_id
        }, function(err, log) {
            if (err)
                res.send(err);
            // get and return all the logs after you create another
            Log.find(function(err, logs) {
                if (err)
                    res.send(err)
                res.json(logs);
            });
        });
    });


};