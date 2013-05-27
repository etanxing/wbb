var express = require('express'),
	app = express(),
	config = require('./config/config').config(process.env.NODE_ENV || 'development')

//Create a Geospatial Index 
//db.DataBupa.ensureIndex( { location : "2d" } );

// express settings
require('./config/express')(app, config);
// routes
require('./config/routes')(app);

var port = process.env.PORT || 7777
app.listen(port);
console.log('Listening on port ' + port);