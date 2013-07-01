var Step = require('step'),
    mongojs = require('mongojs'),
    ObjectId  = mongojs.ObjectId,
    config = require('../../config/config').config().db,
    db = mongojs(config.uri, config.collections),
    moment = require('moment'),
    _ = require('underscore'),
    hyphenify = function () {
        return this.replace(/\s+|\s+$/g,'-')
    };

//Check User
exports.usercheck = function (req, res, next) {
    if (!req.isAuthenticated()) {
        console.log('user check failed');
        return next(new Error('E0001'));
    };
    next();
};

exports.data = function (req, res, next) {
    Step(
        function getData() {
            db.posts.find().count(this.parallel());
            db.tags.find().count(this.parallel());
            db.options.find().count(this.parallel());
        },

        function getCounters (err, posts, tags, options) {
            if (err) return next(err);
            res.json([
                { name : 'Posts', count : posts } ,
                { name : 'Tags', count : tags } ,
                { name : 'Settings', count : options } 
            ])
        }
    )
}

//Get all posts
exports.posts = function (req, res, next) {
    db.posts.find({}, { author: 1, 
                        date: 1, 
                        modified: 1, 
                        date_gmt: 1, 
                        modified_gmt: 1,
                        title: 1,
                        status: 1,
                        slug: 1,
                        password: 1,
                        type: 1,
                        tags: 1}).sort({ date : -1 }, function (err, posts) {
        if (err) return next(err);
        res.json(posts);
    })
};

//Get a post
exports.post = function (req, res, next) {
    db.posts.findOne({ _id : new ObjectId(req.params.id) }, function(err, post) {
        if (err) return next(err);
        post.tags = _.pluck(post.tags, 'taxonomy');
        res.json(post);
    })
}

//Get all tags
exports.settings = function (req, res, next) {
    db.options.find().sort({ name : 1 }, function (err, options) {
        if (err) return next(err);
        res.json(options);
    })
}

//Get all tags
exports.tags = function (req, res, next) {
    db.tags.find().sort({ taxonomy : 1 }, function (err, tags) {
        if (err) return next(err);
        res.json(tags);
    })
}

//Update a Post
exports.updatepost = function (req, res, next) {
    //console.log('body : %s', JSON.stringify(req.body));

    /* 
        1. Get Current datetime
        2. Shortcut for ObjectId
        3. Store new tags string for later use
        4. Prepare for updated data
    */
    console.log('req.body.tags : %s', req.body.tags);
    var newTags = req.body.tags.map(function(tag) { return tag.trim(); }),
        id = new ObjectId(req.body._id),
        postTags = [];

    Step(
        function findOldTags() {
            console.log('findOldTags');
            db.posts.findOne({ _id : id}, { tags : 1, _id : 0 }, this)
        },

        function decreaseTags(err, post) {
            console.log('decreaseTags');
            if (err) return next(err);
            if (!post) return next(new Error('Post not found'));
            console.log('Post.tags : %s', JSON.stringify(post.tags));
            //If there are no tags with the post, then skip
            if (post.tags.length === 0 ) return true;
            var oldtags = post.tags.map(function(tag) { return tag.taxonomy; });
            db.tags.update( { taxonomy : { $in : oldtags} }, { $inc : { count : -1 }}, { multi : true }, this);
        },

        function increaseTags(err) {
            console.log('increaseTags');
            if (err && !_.isBoolean(err)) return next(err);
            //If there are no tags with the post, then skip
            if (newTags.length === 0 ) return true;
            db.tags.update({ taxonomy : { $in : newTags} }, { $inc : { count : 1 }}, { multi : true }, this);
        },

        function getExistingTags(err) {
            if (err && !_.isBoolean(err)) return next(err);
            if (err) return true;
            db.tags.find({ taxonomy : { $in : newTags }}, { taxonomy : 1, slug: 1, count:1, _id: 0}, this);
        },

        function addTags(err, tags) {
            console.log('addTags');
            if (err && !_.isBoolean(err)) return next(err);
            console.log('tags : %s', JSON.stringify(tags));
            var existingTags = !tags?[]:tags.map(function(tag) {
                    postTags.push(tag);
                    return tag.taxonomy; 
                }),
                addedTags = _.difference(newTags, existingTags);

            console.log('addedTags : %s', addedTags);
            if (addedTags.length === 0) return true;

            addedTags = addedTags.map(function(tag) {
                var _tag = {
                    taxonomy : tag,
                    slug : hyphenify.call(tag),
                    count : 1
                };

                postTags.push(_tag);
                return _tag;
            });
            db.tags.insert(addedTags, this);
        },

        function updatePost (err) {
            console.log('updatePost');
            if (err && !_.isBoolean(err)) return next(err);
            console.log('postTags : %s', postTags);
            var now = moment(),                
                data = _.pick(req.body, 'title', 'slug', 'content', 'status', 'type', 'date', 'password');

            data.date = moment(data.date, 'DD/MM/YYYY hh:mm A').format('YYYY-MM-DDTHH:mm:ss Z');
            data.date_gmt = moment(data.date, 'DD/MM/YYYY hh:mm A').utc().format('YYYY-MM-DDTHH:mm:ss Z');
            data.modified = now.format();
            data.modified_gmt = now.utc().format();
            data.tags = postTags.map(function(eachtag) {
                return { taxonomy : eachtag.taxonomy, slug: eachtag.slug};
            });
            db.posts.update({ _id : id }, { $set : data}, this);
        },

        function finish (err) {
            console.log('finish');
            if (err) return next(err);
            res.json(200);
        }
        )

    // db.posts.findAndModify({
    //     query  : { _id : id }, 
    //     update : { $set : data }
    // }, function(err, post) {
    //     if (err || !post) return next(err);
    //     //Compare tags
    //     var removedTags = [],
    //         addedTags = [],
    //         createdTags = [],
    //         newTags = tags.length?tags.split(','):[];

    //     post.tags.forEach(function (tag) {
    //         //If tag doesn't exist in new tags, remove it
    //         if (newTags.indexOf(tag.t) === -1) removedTags.push(tag);
    //     });

    //     newTags.forEach(function (tag) {
    //         //if tag doesn't exist in old tags, add it
    //         if (post.tags.filter(function(oldtag) { return oldtag.t === tag; }).length === 0 ) addedTags.push(tag);
    //     });

    //     /*
    //         1. Increments -1 of count of removeTags
    //         2. Increments 1 of count of addedTags
    //         3. Update tags of post
    //     */

    //     Step(
    //     function decreaseTags() {
    //         if (removedTags.length === 0) return 1;
    //         db.tags.update( { taxonomy : { $in : removedTags} }, { $inc : { count : -1 }}, { multi : true }, this);
    //     },

    //     function findExistingTags(err) {
    //         if (err) return next(err);
    //         if (addedTags.length === 0) return 1;
    //         db.tags.find( { taxonomy : { $in : addedTags } }, { taxonomy : 1, _id : 0 }, this);
    //     },

    //     function increaseTags(err, existingTags) {  
    //         if (existingTags === 1) return 1;
    //         if (err) return next(err);
    //         var existingTags = existingTags.map(function (existingTag) {
    //             return existingTag.taxonomy;
    //         });

    //         addedTags.forEach(function (addTag) {
    //             existingTags.indexOf(addTag) === -1 && createdTags.push(addTag)
    //         })

    //         db.tags.update( { taxonomy : { $in : existingTags} }, { $inc : { count : 1 }}, { multi : true }, this);
    //     },

    //     function insertTags(err, skip) {
    //         if (skip === 1) return 1;
    //         if (err) return next(err);
    //         var reformed = createdTags.map(function (createdTag) {
    //             return {
    //                 taxonomy : createdTag,
    //                 slug     : createdTag.replace(/\s+|\s+$/g,'-'),
    //                 count    : 1
    //             };
    //         });

    //         console.log('reformed : %s', JSON.stringify(reformed));

    //         if (reformed.length === 0 ) return true;
    //         db.tags.insert(reformed, this);
    //     },

    //     function updateTags(err, skip) {
    //         if (err) return next(err);
    //         db.posts.update({ _id : id }, { $set: { tags : newTags }}, this)
    //     },

    //     function complete(err) {
    //         if (err) return next(err);
    //         res.json(200);
    //     }
    //     )

        /*
        console.log('updated. Post: %s', JSON.stringify(post));
        //*/ 
};

//Add a Post
exports.addpost = function (req, res, next) {

    /* 
        1. Get Current datetime
        2. Shortcut for ObjectId
        3. Store new tags string for later use
        4. Prepare for updated data
    */

    var skip = true,
        addedTags = req.body.tags.map(function(tag) { return tag.trim(); }),
        createdTags = [];

    Step(
        function findExistingTags() {
            if (addedTags.length === 0) return skip;
            db.tags.find( { taxonomy : { $in : addedTags } }, { taxonomy : 1, _id : 0 }, this);
        },

        function increaseTags(err, tags) {
            if (err && !_.isBoolean(err)) return next(err);
            if (err) return skip;
            var existingtags = !tags?[]:tags.map(function (tag) {
                createdTags.push({ taxonomy : tag.taxonomy, slug: tag.slug});
                return tag.taxonomy;
            });

            addedTags.forEach(function (addTag) {
                existingtags.indexOf(addTag) === -1 && createdTags.push(addTag)
            })

            db.tags.update( { taxonomy : { $in : existingtags} }, { $inc : { count : 1 }}, { multi : true }, this);
        },

        function insertTags(err, skip) {
            if (skip === 1) return 1;
            if (err) return next(err);
            var reformed = createdTags.map(function (createdTag) {
                return {
                    taxonomy : createdTag,
                    slug     : hyphenify.call(createdTag),
                    count    : 1
                };
            });

            console.log('reformed : %s', JSON.stringify(reformed));

            if (reformed.length === 0 ) return true;
            db.tags.insert(reformed, this);
        },

        function findUser() {
            db.users.findOne({ email : 'etanxing@gmail.com'}, this);
        },

        function insertUser(err, user) {
            if (err) return next(err);

            if (user) return [user];

            var newUser = {
                _id : '518e16c1c8ed5fb4ae000001',
                email : 'etanxing@gmail.com',
                password : '111111',
                nickname : 'william',
                status   : 1
            };

            db.users.insert(newUser, this);
        },

        function insertBlog(err, users) {
            if (err) return next(err);

            var now = moment(),
                date = moment(req.body.date, 'DD/MM/YYYY hh:mm A'),
                newPost = {
                author : { name: users[0].nickname, _id: users[0]._id },
                date : date.format('YYYY-MM-DDTHH:mm:ss Z'),
                modified : now.format(),
                date_gmt : date.utc().format('YYYY-MM-DDTHH:mm:ss Z'),
                modified_gmt : now.utc().format(),
                content : req.body.content,
                title : req.body.title,
                status : req.body.status,
                password : req.body.password,
                type : req.body.tags
            };

            newPost.slug = hyphenify.call(newPost.title);
            addedTags = newPost.tags;
            db.posts.insert(newPost, this);
        },

        function updateTags (err) {
            if (err) return next(err);

                //         tags : req.body.tags.map(function(tag) {
                //     return {
                //         taxonomy : tag.trim(),
                //         slug : tag..replace(/\s+|\s+$/g,'-')
                //     }
                // })
            res.json(200);
        }
    )
}

//Delete Posts
exports.deleteposts = function(req, res, next) {
    var ids = _.clone(req.body.ids || []),
        objids = _.map(ids, function (id) {
            return new ObjectId(id);
        }),
        removedTags = [];

    Step(
        function findTags() {
            db.posts.find({ _id : { $in : objids}}, { _id:0, tags: 1 }, this);
        },

        function deletePosts(err, posts){
            if (err) return next(err);
            _.each(posts, function (post){
                _.each(post.tags, function (tag) {
                    removedTags.indexOf(tag) === -1 && removedTags.push(tag);
                })
            });
            console.log('removedTags: %s', removedTags);
            db.posts.remove({ _id : { $in : objids}}, this);
        },

        function decreaseTags(err) {
            if (err) return next(err);            
            db.tags.update( { taxonomy : { $in : removedTags} }, { $inc : { count : -1 }}, { multi : true }, function (err) {
                if (err) return next(err);
                res.json(ids);
            });
        }
    )
}

//Add tags
exports.addtags = function (req, res, next) {
    var newtags = req.body.newtags || [];
        addedTags = newtags.map(function (newtag) {
        return _.isString(newtag)?newtag.trim():''; 
    });

    Step(
        function findExistingTags() {
            db.tags.find( { taxonomy : { $in : addedTags } }, { taxonomy : 1, _id : 0 }, this);
        },

        function insertTags(err, existingTags) {
            if (err) return next(err);
            var existingtags = existingTags.map(function (existingTag) {
                    return existingTag.taxonomy;
                }),

                createdTags = addedTags.filter(function (newtag) {
                    return existingtags.indexOf(newtag) === -1;
                });

            addedTags = createdTags.map(function (createdTag) {
                return {
                    taxonomy : createdTag,
                    slug     : hyphenify.call(createdTag),
                    count    : 1
                };
            });

            if (addedTags.length === 0 ) return true;
            db.tags.insert(addedTags, this);
        },

        function finish (err) {
            if (err) return next(err);
            res.json(addedTags);
        }
    ) 
};

//Update a tag
exports.updatetag = function (req, res, next) {
    var data = req.body;
    console.log('date: %s', data);
    db.tags.update({ _id : new ObjectId(data._id)}, 
                   { $set : { taxonomy : data.taxonomy , slug: data.slug.replace(/\s+|\s+$/g,'-') }}, 
                   function (err) {
        if (err) return next(err);
        res.json(200);
    })
};

//Delete tags
exports.deletetags = function (req, res, next) {
    var ids = _.clone(req.body.ids || []),
        objids = _.map(ids, function (id) {
            return new ObjectId(id);
        });

    Step(
        function findTags(){
            db.tags.find({ _id : { $in : objids} }, { _id: 0, taxonomy : 1}, this)
        },

        function findPosts(err, tags) {
            if (err || tags.length === 0) return next(err);
            var tags = _.map(tags, function(tag) { return tag.taxonomy; });
            console.log('tags: %s', tags);
            db.posts.update({}, { $pullAll : { tags: tags}}, { multi : true }, this)
        },

        function removeTags (err) {
            if (err) return next(err);
            db.tags.remove({ _id : { $in : objids} }, function (err, result) {
                if (err) return next(err);
                console.log('result: %s', result);
                res.json(ids);
            })
        }
    )
}

//Update a setting
exports.updatesetting = function (req, res, next) {
    var data = req.body,
        id = new ObjectId(data._id);

    delete data._id;
    db.options.update({ _id : id}, { $set : data}, function (err) {
        if (err) return next(err);
        res.json(200);
    })
}

//Add a setting
exports.addsetting= function(req, res, next) {
    db.options.insert(req.body, function(err) {
        if (err) return next(err);
        res.json(200);
    });
}

//Get a setting
exports.setting = function(req, res, next) {
    db.options.findOne({ _id : new ObjectId(req.params.id) }, function(err, setting) {
        if (err) return next(err);
        res.json(setting);
    })
}

//Add item's name
exports.addModel = function (req, res, next) {
    console.log('body : %s', JSON.stringify(req.body));
    req.body.location = [parseFloat(req.body.location[0]), parseFloat(req.body.location[1])]; 
    db.DataBupa.addModel(req.body, function(err) {
        // save completed
        if (err) return next(err);
        console.log('Added.')
        res.send(200);
    });  
};

exports.upload = function(req, res, next) {
    //res.sendfile(req.files.files[0].path);
    //res.json(200, {path:req.files.file.path}); 
    var path = req.files.file.path,
        multi = req.query.multi == '1',
        processRow = function(row, location){
            var loc = location.results[0].geometry.location;
            row.openhours = [];

            for (var i = 1; i<8; i++) {
                if (row['openhour' + i] && row['openhour' + i].length > 0) {
                    var openhours = row['openhour' + i].split('-');
                        openhours = {st:openhours[0], et:openhours[1]};

                    openhours.st = openhours.st.slice(0,5) + ' ' + openhours.st.slice(5);
                    openhours.et = openhours.et.slice(0,5) + ' ' + openhours.et.slice(5); 

                    row.openhours.push(openhours);
                    delete row['openhour' + i];
                }
            }

            row.bb = parseInt(row.bb);
            row.location = [loc.lng,loc.lat];
            row.active = false;
            return row;
        };

    if (multi) {
        csv()
        .from.stream(fs.createReadStream(path), { columns: true })
        .to.array( function(data, count){
            //Geolocate address
            var addModels = data.map(function (row) {
                return function () {
                    var address = row.address2 + ',' + row.suburb + ',' + row.state;
                        self = this;
                    gm.geocode(address, function(err, location){
                        if (location.status == 'OK') {
                            db.DataBupa.addModel(processRow(row, location), self)
                        } else {
                            return next(new Error('failed to geolocate.'))
                        }
                    })
                }
            });

            addModels.push(function(err){
                // save completed
                if (err) return next(err);
                console.log('All models Added.')
                res.json(200, {data:data, count:count});
            });

            Step.apply(null, addModels);
        })
        .on('error', function(err){
            console.log(error.message);
            return next(err)
        }); 
    } else {
        csv()
        .from.stream(fs.createReadStream(path), { columns: true })
        .to.array( function(data, count){
            //Geolocate address
            var firstRow = data[0],
                address = firstRow.address2 + ',' + firstRow.suburb + ',' + firstRow.state;

            gm.geocode(address, function(err, location){
                if (location.status == 'OK') {
                    var addModels = data.map(function(row){
                            return function(){
                                db.DataBupa.addModel(processRow(row, location), this)
                            }
                        });

                    addModels.push(function(err){
                        // save completed
                        if (err) return next(err);
                        console.log('All models Added.')
                        res.json(200, {data:data, count:count});
                    })

                    Step.apply(null, addModels);
                } else {
                    return next(new Error('failed to geolocate.'))
                }
            })
        })
        .on('error', function(err){
            console.log(error.message);
            return next(err)
        });  
    }

}

//Update database directly
exports.updatedb = function (req, res, next) {
    var collection = req.body.collection,
        operation = req.body.operation,
        query = JSON.parse(req.body.query),
        update = JSON.parse(req.body.update),
        readonly = req.body.readonly,
        options = {
            multi : req.body.multi,
            upsert : req.body.upsert
        };

    console.log('collection: %s, operation: %s, query: %s, update: %s, options: %s, readonly: %s', collection, operation, req.body.query, req.body.update, JSON.stringify(options), readonly);

    if ( !readonly == 'true' && operation == 'Update') {
        db[collection].update(query, update , options, function (err) {
            if (err) return next(err);
            res.json(200);
        })
    } else {
        res.json(500);
    }
};