module.exports = function(app) {
    var mongoose = require('mongoose');
    var Customer  = require('../model/customer_model.js') ;
	// api ---------------------------------------------------------------------
	// get all customers
	app.get('/api/customers', function(req, res) {
		// use mongoose to get all customers in the database
		Customer.find(function(err, customers) {
			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err)
			res.json(customers); // return all customers in JSON format
		});
	});

	// create customer and send back all customers after creation
	app.post('/api/customers', function(req, res) {
		// create a customer, information comes from AJAX request from Angular
		Customer.create({
            code : req.body.code,
            name : req.body.name,
            email : req.body.email,
            phone : req.body.phone,
            address : req.body.address
        }, function(err) {
			if (err)
				res.send(err);
            Customer.find(function(err, customers) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err)
                res.json(customers); // return all customers in JSON format
            });
		});
	});

    app.post('/api/update_customers', function(req, res) {
        Customer.findOne({_id: req.body.id}, function(error, customer){
            if(error){
                res.json(error);
            }
            else if(customer == null){
                res.json('no such sevice!')
            }
            else{
                customer[req.body.key] = req.body.value;
                customer.save( function(error){
                    if(error){
                        res.json(error);
                    }
                    Customer.find(function(err, customers) {
                        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                        if (err)
                            res.send(err)
                        res.json(customers); // return all customers in JSON format
                    });
                });
            }
        });

    });

	// delete a customer
    app.delete('/api/customers/:customer_id', function(req, res) {
        Customer.remove({
            _id : req.params.customer_id
        }, function(err, customer) {
            if (err)
                res.send(err);
            Customer.find(function(err, customers) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err)
                res.json(customers); // return all customers in JSON format
            });
        });
    });

};