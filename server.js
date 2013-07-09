var express = require('express'),
	app = express(),
	passport = require('passport'),
	config = require('./config/config').config(process.env.NODE_ENV || 'development')

//Create a Geospatial Index 
//db.DataBupa.ensureIndex( { location : "2d" } );

// bootstrap passport config
require('./config/passport')(passport, config.db);

// express settings
require('./config/express')(app, config, passport);
// routes
require('./config/routes')(app, passport);

var port = process.env.PORT || 7777
app.listen(port);
console.log('Listening on port ' + port);