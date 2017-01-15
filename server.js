
// set up ======================================================================
var express  = require('express');
var app      = express();

var server = require('http').Server(app);
var io = require('socket.io')(4560);

var allClients = [];
io.sockets.on('connection', function (socket) {
    socket.on('update-server', function (data) {
        if(data && data.node != ''){
            io.emit('update-client-'+data.node);
        }else{
            io.emit('update-client');
        }
    });
});
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));


/// Include the node file module
var fs = require('fs');
function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}
app.post('/upload_user', function(req, res) {
    var data = 'data:'+ req.body.filetype +';base64,' + req.body.value;
    var imageBuffer = decodeBase64Image(data);
    fs.writeFile('public/img/users/'+req.body.filename, imageBuffer.data,function (err) {
        if (err){
            res.json(err);
        }
        else{
            res.json(true);
        }
    })

});
app.post('/upload', function(req, res) {
    var data = 'data:'+ req.body.filetype +';base64,' + req.body.value;
    var imageBuffer = decodeBase64Image(data);
   fs.writeFile('public/img/uploads/'+req.body.filename, imageBuffer.data,function (err) {
        if (err){
            res.json(err);
        }
        else{
            res.json(true);
        }
    })
});

var XLSX = require('xlsx');
app.post('/read_excel', function(req, res) {
    var workbook = XLSX.read(req.body.value);
    var sheet_name_list = workbook.SheetNames;
    sheet_name_list.forEach(function(y) {
        var worksheet = workbook.Sheets[y];
        var headers = {};
        var data = [];
        for(z in worksheet) {
            if(z[0] === '!') continue;
            //parse out the column, row, and value
            var col = z.substring(0,1);
            var row = parseInt(z.substring(1));
            var value = worksheet[z].v;

            //store header names
            if(row == 1) {
                headers[col] = value;
                continue;
            }

            if(!data[row]) data[row]={};
            data[row][headers[col]] = value;
        }
        //drop those first two rows which are empty
        data.shift();
        data.shift();
        res.json(data);
    });
})



var mongoose = require('mongoose'); 					// mongoose for mongodb
var port  	 = process.env.PORT || 6789; 				// set the port
var database = require('./config/database'); 			// load the database config

var morgan = require('morgan'); 		// log requests to the console (express4)
var bodyParser = require('body-parser'); 	// pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

// configuration ===============================================================
mongoose.connect(database.url); 	// connect to mongoDB database on modulus.io

app.use(express.static(__dirname + '/public')); 				// set the static files location /public/img will be /img for users
app.use(morgan('dev')); 										// log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'})); 			// parse application/x-www-form-urlencoded
app.use(bodyParser.json()); 									// parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

// routes ======================================================================

require('./api/service.js')(app);
require('./api/customer.js')(app);
require('./api/category.js')(app);
require('./api/user.js')(app);
require('./api/company.js')(app);
require('./api/supplier.js')(app);
require('./api/log.js')(app);
require('./api/coupon.js')(app);
require('./api/store.js')(app);
require('./api/output.js')(app);


require('./api/map.js')(app);
require('./api/book_room.js')(app);

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);
