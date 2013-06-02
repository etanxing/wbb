var Step = require('step'),
    mongojs = require('mongojs'),
    ObjectId  = mongojs.ObjectId,
    config = require('../../config/config').config().db,
    db = mongojs(config.uri, config.collections),
    moment = require('moment');

//Check User
exports.usercheck = function (req, res, next) {
    console.log('user check');
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
    var now = moment(),
        id = new ObjectId(req.body._id),
        tags = req.body.tags.map(function(tag) { return tag.replace(/^\s+|\s+$/g,''); }).join(','),
        data = req.body;

    delete data._id;
    delete data.author;
    delete data.tags;
    data.date = moment(data.date, 'DD/MM/YYYY hh:mm A').format('YYYY-MM-DDTHH:mm:ss Z');
    data.date_gmt = moment(data.date, 'DD/MM/YYYY hh:mm A').utc().format('YYYY-MM-DDTHH:mm:ss Z');
    data.modified = now.format();
    data.modified_gmt = now.utc().format();

    //console.log('data : %s', JSON.stringify(data));

    db.posts.findAndModify({
        query  : { _id : id }, 
        update : { $set : data }
    }, function(err, post) {
        if (err || !post) return next(err);
        //Compare tags
        var removedTags = [],
            addedTags = [],
            createdTags = [],
            newTags = tags.length?tags.split(','):[];

        post.tags.forEach(function (tag) {
            //If tag doesn't exist in new tags, remove it
            if (newTags.indexOf(tag) === -1) removedTags.push(tag);
        });

        newTags.forEach(function (tag) {
            //if tag doesn;t exist in old tags, add it
            if (post.tags.indexOf(tag) === -1) addedTags.push(tag);
        });

        /*
            1. Increments -1 of count of removeTags
            2. Increments 1 of count of addedTags
            3. Update tags of post
        */

        Step(
        function decreaseTags() {
            if (removedTags.length === 0) return 1;
            db.tags.update( { taxonomy : { $in : removedTags} }, { $inc : { count : -1 }}, { multi : true }, this);
        },

        function findExistingTags(err) {
            if (err) return next(err);
            if (addedTags.length === 0) return 1;
            db.tags.find( { taxonomy : { $in : addedTags } }, { taxonomy : 1, _id : 0 }, this);
        },

        function increaseTags(err, existingTags) {  
            if (existingTags === 1) return 1;
            if (err) return next(err);
            var existingTags = existingTags.map(function (existingTag) {
                return existingTag.taxonomy;
            });

            addedTags.forEach(function (addTag) {
                existingTags.indexOf(addTag) === -1 && createdTags.push(addTag)
            })

            db.tags.update( { taxonomy : { $in : existingTags} }, { $inc : { count : 1 }}, { multi : true }, this);
        },

        function insertTags(err, skip) {
            if (skip === 1) return 1;
            if (err) return next(err);
            var reformed = createdTags.map(function (createdTag) {
                return {
                    taxonomy : createdTag,
                    slug     : createdTag.replace(/\s+|\s+$/g,'-'),
                    count    : 1
                };
            });

            console.log('reformed : %s', JSON.stringify(reformed));

            if (reformed.length === 0 ) return true;
            db.tags.insert(reformed, this);
        },

        function updateTags(err, skip) {
            if (err) return next(err);
            db.posts.update({ _id : id }, { $set: { tags : newTags }}, this)
        },

        function complete(err) {
            if (err) return next(err);
            res.json(200);
        }
        )

        /*
        console.log('updated. Post: %s', JSON.stringify(post));
        //*/ 
    });
};

//Add a Post
exports.addpost = function (req, res, next) {

    /* 
        1. Get Current datetime
        2. Shortcut for ObjectId
        3. Store new tags string for later use
        4. Prepare for updated data
    */

    Step(
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
            type : req.body.type,
            tags : req.body.tags.map(function(tag) { return tag.replace(/^\s+|\s+$/g,''); })
        };

        newPost.slug = newPost.title.replace(/\s+|:|\+/g,'-');
        db.posts.insert(newPost, this);
    },

    function finish (err, post) {
        if (err) return next(err);
        res.json(200);
    }
    )
}

//Update item's name by id
exports.model = function (req, res, next) {
    console.log('body : %s', JSON.stringify(req.body));
    var id = req.body._id;
    delete req.body._id;
    db.DataBupa.update({ _id : new ObjectId(id)}, 
                      {$set : req.body}, 
                      function(err) {
        // the update completed
        if (err) return next(err);
        console.log('Updated.')
        res.send(200);
    });    
};

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