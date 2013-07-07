/**
 * Module dependencies.
 */

var express = require('express'),
    fs = require('fs'),
    flash = require('connect-flash'),
    mongoStore = require('connect-mongo')(express),
    log4js = require('log4js/lib/log4js'),
    _ = require('underscore');

module.exports = function (app, config, passport) {

    app.set('showStackError', true)
    // should be placed before express.static
    app.use(express.compress({
        filter: function (req, res) {
            return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    // cookieParser should be above session
    app.use(express.cookieParser())

    // bodyParser should be above methodOverride
    app.use(express.bodyParser({ keepExtensions: true, uploadDir: './upload' }))
    app.use(express.methodOverride())

    app.use('/admin/setting', express.static(config.root + '/public/dist'));
    app.use('/admin/post', express.static(config.root + '/public/dist'));
    app.use('/admin', express.static(config.root + '/public/dist'));

    // set views path, template engine and default layout
    app.engine('us', function(path, options, fn){
        fs.readFile(path, 'utf8', function(err, str){
            if (err) return fn(err);
            try {
                var tmpl = _.template(str, null, options);
                fn(null, tmpl(options).replace(/\n$/, ''));
            } catch(err) {
                fn(err);
            }
        });
    })

    app.set('views', config.root + '/public/dist')
    app.set('view engine', 'us')

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
        app.use(express.session({ secret: 'william-bb-demo' }));
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
        // connect flash for flash messages
        app.use(flash())

        // use passport session
        app.use(passport.initialize())
        app.use(passport.session())

        app.use(express.favicon())

        // routes should be at the last
        app.use(app.router)

        // log Errors
        app.use(function(err, req, res, next){
            var message = '';
            switch (err.message) {
                case 'E0001':
                    err.message = 'user check failed';
                    break;
                default:
                    message = err.message;
                break;
            }

            console.log('Error logged: %s', err.message);            
            console.error(err.stack);
            next(err);
        })

        // client Error Handler
        app.use(function(err, req, res, next){
            if (req.xhr) {
                res.json(500, { msg: err.message, err: true });
            } else {
                next(err);
            }
        })

        // error Handler
        app.use(function(err, req, res, next){
            console.error('FINAL Error logged: %s', err.message);
            res.redirect('http://www.google.com');
        })
    })
}
