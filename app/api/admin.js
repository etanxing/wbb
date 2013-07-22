var Step = require('step'),
    mongojs = require('mongojs'),
    ObjectId = mongojs.ObjectId,
    config = require('../../config/config').config().db,
    db = mongojs(config.uri, config.collections),
    moment = require('moment'),
    _ = require('underscore'),
    Validate = require('../utils/validate'),
    hyphenify = function() {
        return this.replace(/\s+|\s+$/g, '-')
    };

//Check User
exports.usercheck = function(req, res, next) {
    if (!req.isAuthenticated()) {
        console.log('user check failed');
        return next(new Error('E0001'));
    };
    next();
};

exports.data = function(req, res, next) {
    Step(
        function getData() {
            db.posts.find().count(this.parallel());
            db.tags.find().count(this.parallel());
            db.options.find().count(this.parallel());
        },

        function getCounters(err, posts, tags, options) {
            if (err) return next(err);
            res.json([{
                name: 'Posts',
                count: posts
            }, {
                name: 'Tags',
                count: tags
            }, {
                name: 'Settings',
                count: options
            }])
        }
    )
}

//Get all posts
exports.posts = function(req, res, next) {
    db.posts.find({}, {
        author: 1,
        date: 1,
        modified: 1,
        date_gmt: 1,
        modified_gmt: 1,
        title: 1,
        status: 1,
        slug: 1,
        password: 1,
        type: 1,
        tags: 1
    }).sort({
        date: -1
    }, function(err, posts) {
        if (err) return next(err);
        res.json(posts);
    })
};

//Get a post
exports.post = function(req, res, next) {
    db.posts.findOne({
        _id: new ObjectId(req.params.id)
    }, function(err, post) {
        if (err) return next(err);
        res.json(post);
    })
}

//Get all tags
exports.settings = function(req, res, next) {
    db.options.find().sort({
        name: 1
    }, function(err, options) {
        if (err) return next(err);
        res.json(options);
    })
}

//Get all tags
exports.tags = function(req, res, next) {
    db.tags.find().sort({
        taxonomy: 1
    }, function(err, tags) {
        if (err) return next(err);
        res.json(tags);
    })
}

//Update a Post
exports.updatepost = function(req, res, next) {

    /* 
        1. Validate Request
        2. Update a post
    */

    var errors = Validate.validate.call(req.body, 'post');
    if (errors.length > 0) {
        res.json(403, errors);
        return;
    }
    var now = moment(),
        id = new ObjectId(req.params.id),
        data = _.pick(req.body, 'title', 'content', 'status', 'type', 'date', 'password', 'tags');

    //Trim tags
    data.tags = data.tags.map(function(tag) {
        return tag.trim();
    })

    //If slug is valid, update it
    if (req.body.slug.length > 0 ) data.slug = hyphenify.call(req.body.slug);

    data.date = moment(data.date, 'DD/MM/YYYY hh:mm A').format('YYYY-MM-DDTHH:mm:ss Z');
    data.date_gmt = moment(data.date, 'DD/MM/YYYY hh:mm A').utc().format('YYYY-MM-DDTHH:mm:ss Z');
    data.modified = now.format();
    data.modified_gmt = now.utc().format()
    db.posts.update({
        _id: id
    }, {
        $set: data
    }, function(err) {
        if (err) return next(err);
        res.json(200);
    });
};

//Add a Post
exports.addpost = function(req, res, next) {

    /* 
        1. Validate Request
        2. Insert a post
    */

    var errors = Validate.validate.call(req.body, 'post');
    if (errors.length > 0) {
        res.json(403, errors);
        return;
    }

    var now = moment(),
        date = moment(req.body.date, 'DD/MM/YYYY hh:mm A'),
        newPost = {
            author: {
                name: req.user.nickname,
                _id: req.user._id
            },
            date: date.format('YYYY-MM-DDTHH:mm:ss Z'),
            modified: now.format(),
            date_gmt: date.utc().format('YYYY-MM-DDTHH:mm:ss Z'),
            modified_gmt: now.utc().format(),
            content: req.body.content,
            title: req.body.title,
            status: req.body.status,
            password: req.body.password,
            type: req.body.type,
            tags: req.body.tags.map(function(tag) {
                return tag.trim();
            })
        };

    newPost.slug = hyphenify.call(newPost.title);
    addedTags = newPost.tags;
    db.posts.insert(newPost, function(err) {
        if (err) return next(err);
        res.json(200);
    });
}

//Delete Posts
exports.deleteposts = function(req, res, next) {
    var ids = _.clone(req.body.ids || []),
        objids = _.map(ids, function(id) {
            return new ObjectId(id);
        });
        
    db.posts.remove({
        _id: {
            $in: objids
        }
    }, function(err) {
        if (err) return next(err);
        res.json(ids);
    });
}

//Add tags
exports.addtags = function(req, res, next) {
    var newtags = req.body.newtags || [];
    addedTags = newtags.map(function(newtag) {
        return _.isString(newtag) ? newtag.trim() : '';
    });

    Step(
        function findExistingTags() {
            db.tags.find({
                taxonomy: {
                    $in: addedTags
                }
            }, {
                taxonomy: 1,
                _id: 0
            }, this);
        },

        function insertTags(err, existingTags) {
            if (err) return next(err);
            var existingtags = existingTags.map(function(existingTag) {
                return existingTag.taxonomy;
            }),

                createdTags = addedTags.filter(function(newtag) {
                    return existingtags.indexOf(newtag) === -1;
                });

            addedTags = createdTags.map(function(createdTag) {
                return {
                    taxonomy: createdTag,
                    slug: hyphenify.call(createdTag),
                    count: 1
                };
            });

            if (addedTags.length === 0) return true;
            db.tags.insert(addedTags, this);
        },

        function finish(err) {
            if (err) return next(err);
            res.json(addedTags);
        }
    )
};

//Update a tag
exports.updatetag = function(req, res, next) {
    var data = req.body;
    console.log('date: %s', data);
    db.tags.update({
            _id: new ObjectId(data._id)
        }, {
            $set: {
                taxonomy: data.taxonomy,
                slug: data.slug.replace(/\s+|\s+$/g, '-')
            }
        },
        function(err) {
            if (err) return next(err);
            res.json(200);
        })
};

//Delete tags
exports.deletetags = function(req, res, next) {
    var ids = _.clone(req.body.ids || []),
        objids = _.map(ids, function(id) {
            return new ObjectId(id);
        });

    Step(
        function findTags() {
            db.tags.find({
                _id: {
                    $in: objids
                }
            }, {
                _id: 0,
                taxonomy: 1
            }, this)
        },

        function findPosts(err, tags) {
            if (err || tags.length === 0) return next(err);
            var tags = _.map(tags, function(tag) {
                return tag.taxonomy;
            });
            console.log('tags: %s', tags);
            db.posts.update({}, {
                $pullAll: {
                    tags: tags
                }
            }, {
                multi: true
            }, this)
        },

        function removeTags(err) {
            if (err) return next(err);
            db.tags.remove({
                _id: {
                    $in: objids
                }
            }, function(err, result) {
                if (err) return next(err);
                console.log('result: %s', result);
                res.json(ids);
            })
        }
    )
}

//Update a setting
exports.updatesetting = function(req, res, next) {
    var data = req.body,
        id = new ObjectId(data._id);

    delete data._id;
    db.options.update({
        _id: id
    }, {
        $set: data
    }, function(err) {
        if (err) return next(err);
        res.json(200);
    })
}

//Add a setting
exports.addsetting = function(req, res, next) {
    db.options.insert(req.body, function(err) {
        if (err) return next(err);
        res.json(200);
    });
}

//Get a setting
exports.setting = function(req, res, next) {
    db.options.findOne({
        _id: new ObjectId(req.params.id)
    }, function(err, setting) {
        if (err) return next(err);
        res.json(setting);
    })
}

exports.deletesettings = function (req, res, next) {
    var ids = _.clone(req.body.ids || []),
        objids = _.map(ids, function(id) {
            return new ObjectId(id);
        });
        
    db.options.remove({
        _id: {
            $in: objids
        }
    }, function(err) {
        if (err) return next(err);
        res.json(ids);
    });
}