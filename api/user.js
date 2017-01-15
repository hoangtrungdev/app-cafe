module.exports = function(app) {
    var mongoose = require('mongoose');
    var User  =  require('../model/user_model.js');
    var Staff  =  require('../model/staff_model.js');
	// api ---------------------------------------------------------------------
	app.get('/api/users', function(req, res) {
		// use mongoose to get all users in the database
		User.find(function(err, users) {
			res.json(users); // return all users in JSON format
		});
	});
	// create user and send back all users after creation
	app.post('/api/users', function(req, res) {
		// create a user, information comes from AJAX request from Angular
		User.create({
            name : req.body.name,
            address : req.body.address,
            email : req.body.email,
            phone : req.body.phone,
            username : req.body.username,
            password : req.body.password,
            role : req.body.role
        }, function(err) {
            User.find(function(err, users) {
                res.json(users); // return all users in JSON format
            });
		});
	});

    app.post('/api/update_users', function(req, res) {
        User.findOne({_id: req.body.id}, function(error, user){
                user[req.body.key] = req.body.value;
                user.save( function(error){
                    User.find(function(err, users) {
                        res.json(users); // return all users in JSON format
                    });
                });
        });

    });

	// delete a user
    app.delete('/api/users/:user_id', function(req, res) {
        User.remove({
            _id : req.params.user_id
        }, function(err, user) {

            User.find(function(err, users) {
                res.json(users); // return all users in JSON format
            });
        });
    });
    // api ---------------------------------------------------------------------
	app.get('/api/staffs', function(req, res) {
		Staff.find(function(err, staffs) {
			res.json(staffs); // return all staffs in JSON format
		});
	});
	// create staff and send back all staffs after creation
	app.post('/api/staffs', function(req, res) {
		// create a staff, information comes from AJAX request from Angular
		Staff.create(req.body.data, function(err) {
            Staff.find(function(err, staffs) {
                res.json(staffs); // return all staffs in JSON format
            });
		});
	});

    app.post('/api/update_staffs', function(req, res) {
        Staff.findOne({_id: req.body.id}, function(error, staff){
                staff[req.body.key] = req.body.value;
                staff.save( function(error){
                    Staff.find(function(err, staffs) {
                        res.json(staffs); // return all staffs in JSON format
                    });
                });
        });

    });

	// delete a staff
    app.delete('/api/staffs/:staff_id', function(req, res) {
        Staff.remove({
            _id : req.params.staff_id
        }, function(err, staff) {

            Staff.find(function(err, staffs) {
                res.json(staffs); // return all staffs in JSON format
            });
        });
    });

};