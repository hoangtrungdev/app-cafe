
module.exports = function(app) {
    var mongoose = require('mongoose');

    var Map  =  require('../model/map_model.js')
    var Room  =  require('../model/room_model.js');
    // api ---------------------------------------------------------------------
    // get all maps
    app.get('/api/maps', function(req, res) {
        // use mongoose to get all maps in the database
        Map.find(function(err, maps) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)
            res.json(maps); // return all maps in JSON format
        });
    });

    // create map and send back all maps after creation
    app.post('/api/maps', function(req, res) {
        // create a map, information comes from AJAX request from Angular
        Map.create({
            name : req.body.name
        }, function(err, map) {
            if (err)
                res.send(err);
            // get and return all the maps after you create another
            Map.find(function(err, maps) {
                if (err)
                    res.send(err)
                res.json(maps);
            });
        });
    });

    app.post('/api/update_maps', function(req, res) {

        Map.findOne({_id: req.body.id}, function(error, map){
            if(error){
                res.json(error);
            }
            else if(map == null){
                res.json('no such sevice!')
            }
            else{
                map[req.body.key] = req.body.value;
                map.save( function(error, data){
                    if(error){
                        res.json(error);
                    }
                    Map.find(function(err, maps) {
                        if (err)
                            res.send(err)
                        res.json(maps);
                    });
                });
            }
        });

    });

    // delete a map
    app.delete('/api/maps/:map_id', function(req, res) {
        Map.remove({
            _id : req.params.map_id
        }, function(err, map) {
            if (err)
                res.send(err);
            // get and return all the maps after you create another
            Map.find(function(err, maps) {
                if (err)
                    res.send(err)
                res.json(maps);
            });
        });
    });

    //----------------------
    app.get('/api/rooms', function(req, res) {
        Room.find(function(err, rooms) {
            res.json(rooms); // return all maps in JSON format
        });
    });
    app.post('/api/rooms', function(req, res) {
        Room.create({
            name : req.body.name,
            floor_id : req.body.floor_id
        }, function(err, map) {
            Room.find(function(err, maps) {
                res.json(maps);
            });
        });
    });
    app.delete('/api/rooms/:room_id', function(req, res) {
        Room.remove({
            _id : req.params.room_id
        }, function(err, room) {
                res.json(room);
        });
    });
    app.post('/api/update_rooms', function(req, res) {
        Room.findOne({_id: req.body.id}, function(error, room){
            room[req.body.key] = req.body.value;
            room.save( function(error, data){
                Room.find(function(err,rooms) {
                    res.json(rooms);
                });
            });
        });
    });



};