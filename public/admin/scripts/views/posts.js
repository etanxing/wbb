/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',    
    '../common',
    '../views/listpost',
    '../views/navigation',
    'text!../templates/posts.html',
    'humane'
], function ($, _, Backbone, Common, ListPostView, NavigationView, posts, humane) {
    'use strict';

    var PostsView = Backbone.View.extend({        
        className: 'posts-view',

        events : {
            'click .listpost a' : 'post'
        },

        initialize: function() {
            _.bindAll(this, 'addAll', 'addOne', 'renderNavigation');
            this.listenTo(this.collection, 'reset', this.addAll);
        },

        render : function() {           
            this.$el.html(posts);
            this.collection.fetch({
                success: this.renderNavigation,
                silent:true,
                error : function(collection, resp, options) {
                    var err = JSON.parse(resp.responseText);
                    humane.log(err.msg);                    
                }
            });

            return this;
        },

        addAll : function() {
            this.$('.postlist tbody').empty();
            this.collection.each(this.addOne);
            this.collection.models.length === 0 && this.$('.postlist tbody').html('<tr><td colspan="7">No posts or pages found.</td></tr>');
        },

        addOne: function (post) {
            var view = new ListPostView({model:post});
            this.$('.postlist tbody').append(view.render().el);
        },

        renderNavigation : function () {            
            this.collection.pager();                   
            this.navigationViewUp = new NavigationView({collection : this.collection, className : 'navigation up'}),
            this.navigationViewDown = new NavigationView({collection : this.collection, className : 'navigation down'});
            this.$('.postlist')
            .before(this.navigationViewUp.render().el)
            .after(this.navigationViewDown.render().el);                
        },

        unrender : function () {
            this.navigationViewUp.remove();
            this.navigationViewDown.remove();
            this.$el.detach();            
        },

        post : function(e) {
            Backbone.history.navigate(e.target.pathname, true);
            return false;
        }
    });

    return PostsView;
});