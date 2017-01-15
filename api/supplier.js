module.exports = function(app) {
    var mongoose = require('mongoose');
    var Supplier  = require('../model/supplier_model.js') ;
	// api ---------------------------------------------------------------------
	// get all customers
	app.get('/api/suppliers', function(req, res) {
		// use mongoose to get all suppliers in the database
		Supplier.find(function(err, suppliers) {
			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err)
			res.json(suppliers); // return all suppliers in JSON format
		});
	});

	// create supplier and send back all suppliers after creation
	app.post('/api/suppliers', function(req, res) {
		// create a supplier, information comes from AJAX request from Angular
		Supplier.create({
            code : req.body.code,
            name : req.body.name,
            address : req.body.address,
            email : req.body.email ,
            phone : req.body.phone
        }, function(err) {
			if (err)
				res.send(err);
            Supplier.find(function(err, suppliers) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err)
                res.json(suppliers); // return all suppliers in JSON format
            });
		});
	});

    app.post('/api/update_suppliers', function(req, res) {
        Supplier.findOne({_id: req.body.id}, function(error, supplier){
            if(error){
                res.json(error);
            }
            else if(supplier == null){
                res.json('no such sevice!')
            }
            else{
                supplier[req.body.key] = req.body.value;
                supplier.save( function(error){
                    if(error){
                        res.json(error);
                    }
                    Supplier.find(function(err, suppliers) {
                        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                        if (err)
                            res.send(err)
                        res.json(suppliers); // return all suppliers in JSON format
                    });
                });
            }
        });

    });

	// delete a supplier
    app.delete('/api/suppliers/:supplier_id', function(req, res) {
        Supplier.remove({
            _id : req.params.supplier_id
        }, function(err, supplier) {
            if (err)
                res.send(err);
            Supplier.find(function(err, suppliers) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err)
                res.json(suppliers); // return all suppliers in JSON format
            });
        });
    });
    app.post('/api/check_supplier/', function(req, res) {
        var set = {};
        set[req.body.key] = req.body.value;
        Supplier.findOne(set, function(error, sup){
            if (error)
                res.send(error);
            // get and return all the services after you create another
            res.json(sup);
        });
    });

};