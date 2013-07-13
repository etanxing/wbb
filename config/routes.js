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

    //Get Counters
    app.get('/admin/api/data', admin.usercheck, admin.data);

    //Get Posts
    app.get('/admin/api/posts', admin.usercheck, admin.posts);

    //Get a Post
    app.get('/admin/api/post/:id?', admin.usercheck, admin.post);

    //Get Settings
    app.get('/admin/api/settings', admin.usercheck, admin.settings);

    //Get Tags
    app.get('/admin/api/tags', admin.usercheck, admin.tags);

    //Update a Post
    app.put('/admin/api/post/:id', admin.usercheck, admin.updatepost);

    //Add a Post
    app.post('/admin/api/post', admin.usercheck, admin.addpost);

    //Delete Posts
    app.delete('/admin/api/posts', admin.usercheck, admin.deleteposts)

    //Add tags
    app.post('/admin/api/tags', admin.usercheck, admin.addtags);

    //Update a tag
    app.put('/admin/api/tag/:id', admin.usercheck, admin.updatetag);

    //Delete a tag
    app.delete('/admin/api/tags', admin.usercheck, admin.deletetags);

    //Update a setting
    app.put('/admin/api/setting/:id', admin.usercheck, admin.updatesetting);

    //Add a setting
    app.post('/admin/api/setting', admin.usercheck, admin.addsetting);

    //Get a setting
    app.get('/admin/api/setting/:id?', admin.usercheck, admin.setting);

    /***************** Admin API END  ******************/


    /***************** Establish DB API START ******************/
    var misc = require('../app/api/misc');

    //Import suburbs from Bupa
    app.get('/api/updatedb', misc.updateDB);

    //Lowercase/Trim fields 
    app.get('/api/update', misc.updateFields)


    /***************** Establish DB API END  ******************/
}
