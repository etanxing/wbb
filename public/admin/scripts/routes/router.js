/*global define*/

define([
    'jquery',
    'backbone',
    '../common',
    '../models/post',
    '../collections/posts',
    '../collections/settings',
    '../collections/tags',
    '../views/login',
    '../views/dashboard',
    '../views/posts',
    '../views/post',
    '../views/sidemenu',
    '../views/tags',
    '../views/settings',
    '../views/setting'
], function ($, Backbone, Common, Post, Posts, Settings, Tags, 
                LoginView, DashboardView, PostsView, PostView, 
                SidemenuView, TagsView, SettingsView, SettingView) {
    'use strict';

    var Router = Backbone.Router.extend({
    	initialize : function() {
            this.data = {
                posts : new Posts(),
                tags: new Tags(),
                settings : new Settings()
            }

    		this.views = {
    			login : new LoginView(),
                sidemenu : new SidemenuView(),
                dashboard : new DashboardView(),
                posts : new PostsView({collection : this.data.posts}),
                post : new PostView(),
                tags : new TagsView({collection : this.data.tags }),
                settings : new SettingsView({collection : this.data.settings }),
                setting : new SettingView()
    		}

            this.view = undefined;
            this.lastRouter = '';
            this.on('route', this.updateLastRouter);

            $('.container').html(this.views.sidemenu.render().el);
    	},

        updateLastRouter : function(router){
            this.lastRouter = router;
            console.log('router: %s', router);
        },

        // Hash maps for routes
        routes : {
            'admin'          : 'index',
            'admin/dashboard' : 'dashboard',
            'admin/posts'     : 'posts',
            'admin/post(/:id)': 'post', 
            'admin/tags'      : 'tags',
            'admin/settings'  : 'settings',
            'admin/setting(/:id)' : 'setting',
            '*path'           : 'page404'
        },

        index: function(){
            this.setBody('login', false);
        },

        dashboard : function() {
            this.setBody('dashboard', true);
        },

        posts : function() {
            this.setBody('posts', true);
        },

        post : function(id) {
            this.setBody('post', id, true);
        },

        tags : function() {
            this.setBody('tags', true);
        },

        settings : function() {
            this.setBody('settings', true);
        },

        setting : function(id) {
            this.setBody('setting', id, true);
        },

        page404: function() {
            this.navigate('admin', {trigger: true, replace: false});
            console.log('r u lost?');
        },

        setBody: function() {
            var arrys = _.toArray(arguments),
                auth = arrys.pop(),
                viewname = arrys.shift();

            if ( !auth || auth && user.id ) {
                this.view && this.view.unrender();
                this.view = this.views[viewname];
                $('#container')
                .prepend(this.view.el);

                this.view.render(arrys);
            } else {
                this.navigate('admin', true);
            }
        }
    });

    return Router;
});