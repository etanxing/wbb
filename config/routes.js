module.exports = function (app, passport) {

    /***************** ROUTERS START ******************/ 
    var common = require('../app/controllers/common');

    //Enable cross-origin access
    app.all('*', common.all);

    app.get('*', common.getall);

    app.options('*', common.optionsall);

    /***************** ROUTERS END ******************/ 

    /***************** Public API START ******************/ 
    var public = require('../app/api/public');

    //Get Default Settings
    app.get('/api/settings', public.settings);

    //Get items by suburb and medicaltype
    app.get('/api/items', public.count, public.items);

    //Get suburb name list by start charactors
    app.get('/api/item/slug/:slug', public.itemslug);

    /***************** Public API END   ******************/ 


    /***************** Admin API START ******************/
    var admin = require('../app/api/admin');

    //Login
    app.post('/admin', passport.authenticate('local', { successRedirect: '/admin/dashboard', failureRedirect: '/admin/', failureFlash: true }));

    //user check on all admin api
    app.all('/admin/api/*', admin.usercheck);

    //Get Counters
    app.get('/admin/api/data', admin.data);

    //Get Posts
    app.get('/admin/api/posts', admin.posts);

    //Get a Post
    app.get('/admin/api/post/:id?', admin.post);

    //Get Settings
    app.get('/admin/api/settings', admin.settings);

    //Get Tags
    app.get('/admin/api/tags', admin.tags);

    //Update a Post
    app.put('/admin/api/post/:id', admin.updatepost);

    //Add a Post
    app.post('/admin/api/post', admin.addpost);

    //Delete Posts
    app.delete('/admin/api/posts', admin.deleteposts)

    //Add tags
    app.post('/admin/api/tags', admin.addtags);

    //Update a tag
    app.put('/admin/api/tag/:id', admin.updatetag);

    //Delete a tag
    app.delete('/admin/api/tags', admin.deletetags);

    //Update a setting
    app.put('/admin/api/setting/:id', admin.updatesetting);

    //Add a setting
    app.post('/admin/api/setting', admin.addsetting);

    //Get a setting
    app.get('/admin/api/setting/:id?', admin.setting);

    //Delete Settings
    app.delete('/admin/api/settings', admin.deletesettings)

    /***************** Admin API END  ******************/
}
