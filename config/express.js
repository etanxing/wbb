/**
 * Module dependencies.
 */

var express = require('express'),
    fs = require('fs'),
    mongoStore = require('connect-mongo')(express),
    log4js = require('log4js/lib/log4js');

module.exports = function (app, config) {

    app.set('showStackError', true)
    // should be placed before express.static
    app.use(express.compress({
        filter: function (req, res) {
            return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
        },
        level: 9
    }))

    app.use(express.static(config.root + '/public/'))

    // production only
    app.configure('production', function(){
        //express/mongo session storage
        app.use(express.session({
            secret: 'noobjs',
            store: new mongoStore({
                url: config.db,
                collection : 'sessions'
            })
        }))
    })

    // development only
    app.configure('development', function(){
        app.use(express.logger('dev'));
            
        //log the cheese logger messages to a file, and the console ones as well.
        log4js.configure({
            appenders: [
                // {
                //     type: "file",
                //     filename: "cheese.log",
                //     category: [ 'cheese','console' ]
                // },
                {
                    type: "console"
                }
            ],
            replaceConsole: true
        });
    })

    // all environments
    app.configure(function () {
        // cookieParser should be above session
        app.use(express.cookieParser())

        // bodyParser should be above methodOverride
        app.use(express.bodyParser({ keepExtensions: true, uploadDir: './upload' }))
        app.use(express.methodOverride())

        app.use(express.favicon())

        // routes should be at the last
        app.use(app.router)

        // log Errors
        app.use(function(err, req, res, next){
            console.log('Error logged: %s', err.message);
            next(err);
        })

        // client Error Handler
        app.use(function(err, req, res, next){
            if (req.xhr) {
                res.json(500, { error: err });
            } else {
                next(err);
            }
        })

        // error Handler
        app.use(function(err, req, res, next){
            console.error('FINAL Error logged: %s', err.message);
            res.status(500);
            res.json('error', { error: err });
        })
    })
}
