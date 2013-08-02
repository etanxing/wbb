var fs = require('fs'),
    path = require('../../config/config').config().root;

exports.all = function (req, res, next) {
    res.set({
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Methods': 'PUT, GET, POST, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    next();
}

exports.getall = function (req, res, next) {
    //Don't process requests for API endpoints
    if (req.query.q || req.url.indexOf('/api') == 0 || req.url.indexOf('/admin/api') == 0 ) return next();
    res.redirect('/?q=' + req.url);
}

exports.index = function (req, res, next) {
    res.render('index', { userid: req.isAuthenticated()?req.user._id:undefined, path: req.query.q});
}

exports.optionsall = function(req, res, next) {
    res.send(200);
}

   