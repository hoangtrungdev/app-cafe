module.exports = function(app) {
    var mongoose = require('mongoose');
    var Coupon  =  require('../model/coupon_model.js');
	// api ---------------------------------------------------------------------
	// get all coupons
	app.get('/api/coupons', function(req, res) {
		// use mongoose to get all coupons in the database
		Coupon.find(function(err, coupons) {
			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err)
			res.json(coupons); // return all coupons in JSON format
		});
	});

	// create coupon and send back all coupons after creation
	app.post('/api/coupons', function(req, res) {
		// create a coupon, information comes from AJAX request from Angular
		Coupon.create({
            code : req.body.code,
            start : req.body.start,
            end : req.body.end,
            type : req.body.type,
            value : req.body.value,
            status : true
        }, function(err) {
			if (err)
				res.send(err);
            Coupon.find(function(err, coupons) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err)
                res.json(coupons); // return all coupons in JSON format
            });
		});
	});

    app.post('/api/update_coupons', function(req, res) {
        Coupon.findOne({_id: req.body.id}, function(error, coupon){
            if(error){
                res.json(error);
            }
            else if(coupon == null){
                res.json('no such sevice!')
            }
            else{
                coupon[req.body.key] = req.body.value;
                coupon.save( function(error){
                    if(error){
                        res.json(error);
                    }
                    Coupon.find(function(err, coupons) {
                        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                        if (err)
                            res.send(err)
                        res.json(coupons); // return all coupons in JSON format
                    });
                });
            }
        });

    });
    app.get('/api/check_coupon/:code', function(req, res) {
        Coupon.findOne({code: req.params.code}, function(error, coupon){
            if (error)
                res.send(error);
            // get and return all the coupons after you create another
            res.json(coupon);
        });
    });
	// delete a coupon
    app.delete('/api/coupons/:coupon_id', function(req, res) {
        Coupon.remove({
            _id : req.params.coupon_id
        }, function(err, coupon) {
            if (err)
                res.send(err);
            Coupon.find(function(err, coupons) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err)
                res.json(coupons); // return all coupons in JSON format
            });
        });
    });

};