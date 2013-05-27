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
    '../views/sidemenu'
], function ($, Backbone, Common, Post, Posts, Settings, Tags, LoginView, DashboardView, PostsView, PostView, SidemenuView) {
    'use strict';

    var Router = Backbone.Router.extend({
    	initialize : function() {
            this.data = {
                posts : new Posts(),
                settings : new Settings()
            }

    		this.views = {
    			login : new LoginView(),
                sidemenu : new SidemenuView(),
                dashboard : new DashboardView(),
                posts : new PostsView({collection : this.data.posts}),
                post : new PostView()
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
            'admin/'          : 'index',
            'admin/dashboard' : 'dashboard',
            'admin/posts'     : 'posts',
            'admin/post/:id'  : 'post', 
            '*path'           : 'page404'
        },

        index: function(){
            this.setBody('login');
        },

        dashboard : function() {
            this.setBody('dashboard');
        },

        posts : function() {
            this.setBody('posts');
        },

        post : function(id) {
            this.setBody('post', id);
        },

        page404: function() {
            console.log('r u lost?');
        },

        setBody: function(viewname, options) {
            this.view && this.view.unrender();
            this.view = this.views[viewname];
            $('#container')
            .prepend(this.view.render(options).el);
        }
    });

    return Router;
});