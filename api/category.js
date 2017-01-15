module.exports = function(app) {
    var mongoose = require('mongoose');
    var Category  =  require('../model/category_model.js');
	// api ---------------------------------------------------------------------
	// get all categorys
	app.get('/api/categorys', function(req, res) {
		// use mongoose to get all categorys in the database
		Category.find(function(err, categorys) {
			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err)
			res.json(categorys); // return all categorys in JSON format
		});
	});

	// create category and send back all categorys after creation
	app.post('/api/categorys', function(req, res) {
		// create a category, information comes from AJAX request from Angular
		Category.create({
            code : req.body.code,
            type : req.body.type,
            name :req.body.name
        }, function(err) {
			if (err)
				res.send(err);
            Category.find(function(err, categorys) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err)
                res.json(categorys); // return all categorys in JSON format
            });
		});
	});

    app.post('/api/update_categorys', function(req, res) {
        Category.findOne({_id: req.body.id}, function(error, category){
            if(error){
                res.json(error);
            }
            else if(category == null){
                res.json('no such sevice!')
            }
            else{
                category[req.body.key] = req.body.value;
                category.save( function(error){
                    if(error){
                        res.json(error);
                    }
                    Category.find(function(err, categorys) {
                        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                        if (err)
                            res.send(err)
                        res.json(categorys); // return all categorys in JSON format
                    });
                });
            }
        });

    });

	// delete a category
    app.delete('/api/categorys/:category_id', function(req, res) {
        Category.remove({
            _id : req.params.category_id
        }, function(err, category) {
            if (err)
                res.send(err);
            Category.find(function(err, categorys) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err)
                res.json(categorys); // return all categorys in JSON format
            });
        });
    });
    app.post('/api/check_category/', function(req, res) {
        var set = {};
        set[req.body.key] = req.body.value;
        Category.findOne(set, function(error, cate){
            if (error)
                res.send(error);
            // get and return all the services after you create another
            res.json(cate);
        });
    });

};