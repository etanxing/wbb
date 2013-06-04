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
            'admin/post(/:id)': 'post', 
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

        page404: function() {
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
                this.navigate('admin/', true);
            }
        }
    });

    return Router;
});