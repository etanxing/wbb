var http = require('http'),
    mongojs = require('mongojs'),
    config = require('../../config/config').config().db,
    db = mongojs(config.uri, config.collections),
    Step = require('step'),
    moment = require('moment');

//Run db operations here
exports.updateDB = function (req, res, next) {
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
            newPost = {
            author : { name: users[0].nickname, _id: users[0]._id },
            date : now.format(),
            modified : now.format(),
            date_gmt : now.utc().format(),
            modified_gmt : now.utc().format(),
            content : 'Lorem ipsum dolor sit amet, id quaeque suscipiantur pri, eu sit fierent definiebas, mea id quod facete. Has idque constituam contentiones ei, ea oporteat perpetua sadipscing vix, scaevola recteque interesset sit te. Numquam dissentias ad eam, at ius erat regione. Unum scripta quo ad, ex vel graece inciderint, ad mundi nonumy facilisi has.In amet nostrud persecuti pro, ei facer verterem sea. Qui ei novum tollit populo, everti virtute pertinacia te eos, possim aliquando ius ea. Illud nominati indoctum an his, sea apeirian ocurreret id. Ex mel aeterno definitiones delicatissimi, epicuri pertinax eu nec, splendide hendrerit ne vel. Eum an sint paulo quaestio. Affert scribentur ex nec, bonorum deserunt definiebas his no. Quodsi bonorum necessitatibus nam an. No amet deleniti sea, illud summo repudiare ea nam. Affert integre quaestio quo no, in facete accusamus mei. Nam inermis necessitatibus cu, quando maiestatis his ad. An eos laoreet splendide. Eos ex tota harum salutandi.',
            title : 'post-',
            status : 1,
            password : '',
            type : 1,
            tags : []
        };

        newPost.slug = newPost.title += newPost.date.replace(/:|\+/g,'-');
        db.posts.insert(newPost, this);
    },

    function finish (err, posts) {
        if (err) return next(err);
        res.json(posts);
    }
    );
};

//Update item's name by id
exports.updateFields = function (req, res, next) {
    var method = req.query.m,
        collecion = req.query.c,
        fields = req.query.f.split(','),

        set = function(doc) {
            var result = {};
            for (var p in fields)
                result[fields[p]] = methods[method](doc[fields[p]]);
            return result;
        },

        methods = {
            tolower : function(str) {
                return str.toLowerCase();
            },

            totrim : function(str) {
                return str.replace(/^\s+|\s+$/g,'');
            },

            toreplacebrackets : function(str) {
                return str.replace(/\(/,'').replace(/\)/,'');
            }
        },

        updateItem = function (doc) {
            var deferred = when.defer();

            db[collecion].update({_id: doc._id}, {$set: set(doc)}, function (err) {
                if (err) deferred.reject(new Error('Error ID: ' + doc._id));
                deferred.resolve();
            });

            return deferred.promise;
        },

        updateItems = function(docs) {
            var deferreds = [];

            docs.forEach(function (doc) {
                deferreds.push(updateItem(doc));
            });

            return when.all(deferreds);
        };

    db[collecion].find(function (err, docs) {
        if (err) next(new Error('failed to update ' + collecion + ': ' + err));
        console.log('Finished to find');
        updateItems(docs)
        .then(  
            function success() {
                res.send(200);
                console.log('Finished to update ' + collecion);
            },
            function error(err) {
                console.log(err);
            }
        );
    });
};