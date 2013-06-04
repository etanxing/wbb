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
    if (req.url.indexOf('/api') == 0 || req.url.indexOf('/admin/api') == 0 ) return next();
    
    var init = 'var user = user || {}';
    fs.readFile(path + '/public/admin/index.html', 'utf8', function(error, content) {        
        if (error) console.log(error);
        if (req.isAuthenticated()) init = 'var user = user || { id : "' + req.user._id + '"}';
        res.send(200, content.replace("{{init}}", init));        
    });
}

exports.optionsall = function(req, res, next) {
    res.send(200);
}

   