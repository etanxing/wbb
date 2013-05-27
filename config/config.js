var instance,
    _config = {
        development: {      
            root: require('path').normalize(__dirname + '/..'),
            app: {
                name: 'Caremedi'
            },
            //mongodb://william:xingyupeng@dharma.mongohq.com:10006/bb
            //mongodb://william:xingyupeng@ds053497.mongolab.com:53497/bb
            db: {
                uri : 'mongodb://william:sunshuyu520@dharma.mongohq.com:10006/bb',
                collections: ['posts', 'users', 'options', 'tags']
            },
            facebook: {
                clientID: "APP_ID"
                , clientSecret: "APP_SECRET"
                , callbackURL: "http://localhost:3000/auth/facebook/callback"
            },
            twitter: {
                clientID: "CONSUMER_KEY"
                , clientSecret: "CONSUMER_SECRET"
                , callbackURL: "http://localhost:3000/auth/twitter/callback"
            },
            github: {
                clientID: 'APP_ID'
                , clientSecret: 'APP_SECRET'
                , callbackURL: 'http://localhost:3000/auth/github/callback'
            },
            google: {
                clientID: "APP_ID"
                , clientSecret: "APP_SECRET"
                , callbackURL: "http://localhost:3000/auth/google/callback"
            }
        },

        test: {
        },

        production: {
        }
};

module.exports = {
    config: function (env) {
        if (instance === undefined) { 
            instance = _config[env];
        }

        return instance; 
    }
}



