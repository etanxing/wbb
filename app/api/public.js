var config = require('../../config/config').config().db,
    mongojs = require('mongojs'),
    db = mongojs(config.uri, config.collections);

//Get Settings
exports.settings = function (req, res, next) {
	db.options.find({onload : 1}, { name:1, value:1, _id:0 }, function (err, options) {
		if (err) return next(err);
		res.json(options);
	})
}

//Get items by suburb and medicaltype
exports.count = function (req, res, next) {
	db.posts.find({status : 1, type : 1 }).count(function (err, cnt) {
		if (err) return next(err);
		req.count = cnt;
		next();
	})
}

exports.items = function (req, res, next) {
	var perpage = parseInt(req.query.$perpage),
		page = parseInt(req.query.$page);

	db.posts.find({status : 1, type : 1 }).skip( (page - 1) * perpage ).limit( perpage ).sort({ date : -1 }, function (err, posts) {
		if (err) return next(err);
		res.json({ error : null, posts : posts, info : { totalRecords : req.count } });
	})
}

//Get suburb name list by start charactors
exports.itemslug = function (req, res, next) {
	db.posts.findOne({ slug : req.params.slug }, function (err, post) {
		var settings = req.options || {};
		if (err) return next(err);
		if (!post) return next(new Error( req.params.slug + ' not found.'))
		res.json({ error : null, post : post});
	})
};