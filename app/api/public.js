var config = require('../../config/config').config().db,
    mongojs = require('mongojs'),
    db = mongojs(config.uri, config.collections);

//Get Settings
exports.settings = function(req, res, next) {
    db.options.find({
        onload: 1
    }, {
        name: 1,
        value: 1,
        _id: 0
    }, function(err, options) {
        if (err) return next(err);
        req.data.settings = options;
        next();
    })
}

//Get items by suburb and medicaltype
exports.count = function(req, res, next) {
    if (req.data.post) {
        next();
    } else {
        db.posts.find({
            status: 1,
            type: 1
        }).count(function(err, cnt) {
            if (err) return next(err);
            req.data.count = cnt;
            next();
        })
    }
}

exports.items = function(req, res, next) {
    var perpage = parseInt(req.query.$perpage),
        page = parseInt(req.query.$page || 1);

    if (req.data.count) {
        db.posts.find({
            status: 1,
            type: 1
        }).skip((page - 1) * perpage).limit(perpage).sort({
            date: -1
        }, function(err, posts) {
            if (err) return next(err);
            req.data.posts = posts;
            next();
        })
    } else {
        next();
    }
}

//Get suburb name list by start charactors
exports.itemslug = function(req, res, next) {
    var slug = req.query.slug || req.params.slug;
    if (slug) {
        db.posts.findOne({
            slug: slug
        }, function(err, post) {
            var settings = req.options || {};
            if (err) return next(err);
            if (!post) return next(new Error(slug + ' not found.'))
            req.data.post = post;
            next();
        })
    } else {
        next();
    }
};

exports.start = function(req, res, next) {
	req.data = {};
	next();
}


//Organise data for returning to client side
exports.end = function(req, res, next) {
    req.data.error = null;
    res.json(req.data);
}
