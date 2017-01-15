module.exports = function(app) {
    var mongoose = require('mongoose');
    var Company  = require('../model/company_model.js') ;
	// api ---------------------------------------------------------------------
	// get all customers
	app.get('/api/companys', function(req, res) {
		// use mongoose to get all companys in the database
		Company.find(function(err, companys) {
			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err)
			res.json(companys); // return all companys in JSON format
		});
	});

	// create company and send back all companys after creation
	app.post('/api/companys', function(req, res) {
		// create a company, information comes from AJAX request from Angular
		Company.create({
            company : req.body.company,
            vat : req.body.vat,
            mst : req.body.mst
        }, function(err) {
			if (err)
				res.send(err);
            Company.find(function(err, companys) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err)
                res.json(companys); // return all companys in JSON format
            });
		});
	});

    app.post('/api/update_companys', function(req, res) {
        Company.findOne({_id: req.body.id}, function(error, company){
            if(error){
                res.json(error);
            }
            else if(company == null){
                res.json('no such sevice!')
            }
            else{
                company[req.body.key] = req.body.value;
                company.save( function(error){
                    if(error){
                        res.json(error);
                    }
                    Company.find(function(err, companys) {
                        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                        if (err)
                            res.send(err)
                        res.json(companys); // return all companys in JSON format
                    });
                });
            }
        });

    });

	// delete a company
    app.delete('/api/companys/:company_id', function(req, res) {
        Company.remove({
            _id : req.params.company_id
        }, function(err, company) {
            if (err)
                res.send(err);
            Company.find(function(err, companys) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err)
                res.json(companys); // return all companys in JSON format
            });
        });
    });

};