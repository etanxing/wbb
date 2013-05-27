/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    '../models/post',
    'text!../templates/post.html',
    '../common',    
    'form'
], function ($, _, Backbone, Post, post, Common) {
    'use strict';

    var PostView = Backbone.View.extend({
        className : 'post-view',

        initialize: function() {
            _.bindAll(this, 'renderPost');
        },

        render: function(id) {
            var post = new Post();
            post.set('_id', id);

            post.fetch({ success : this.renderPost });

            // this.model.set('id', id);
            // this.model.fetch({
            //     success: function(model, resp, options){
            //         self.renderPost();
            //     },

            //     error : function(model, resp, options){
            //         // 404 page
            //         console.log('failed to load model: %s', resp.responseText);
            //     }
            // })

            return this;
        },

        renderPost: function(model) {
            var form = new Backbone.Form({
                model: model
            }).render();

            this.$el.html(form.el);

            // $(this.el).html(_.template(post)({
            //     post  : model.toJSON()
            // }))
        },

        unrender: function () {
            this.remove();
        }
    });

    return PostView;
});