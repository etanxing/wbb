module.exports = function (app) {

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

    //Get items by name and medicaltype
    app.get('/api/collection', admin.collection);

    //Update item's name by id
    app.put('/api/model', admin.model);

    //Update item's fields only changed
    app.patch('/api/model', admin.model);

    //Add item's name
    app.post('/api/model', admin.addModel);

    //Upload file
    app.post('/upload', admin.upload);

    //Update database directly
    app.post('/api/db', admin.updatedb);

    /***************** Admin API END  ******************/


    /***************** Establish DB API START ******************/
    var misc = require('../app/api/misc');

    //Import suburbs from Bupa
    app.get('/api/updatedb', misc.updateDB);

    //Lowercase/Trim fields 
    app.get('/api/update', misc.updateFields)


    /***************** Establish DB API END  ******************/
}
