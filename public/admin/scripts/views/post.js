/*global define*/

define([
    'datetimepicker',
    'underscore',
    'backbone',
    'moment',
    '../models/post',
    'text!../templates/post.html',
    'tagsinput'
], function ($, _, Backbone, moment, Post, post) {
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

            return this;
        },

        renderPost: function(model) {
            this.$el.html(_.template(post)({
                post   : model.toJSON(),
                status : [[1, 'Published'], [2, 'Password'], [3, 'Draft']],
                type   : [[1, 'Post'], [2, 'Page']]
            }));

            this.$('#date').datetimepicker({
                dateFormat: 'dd/mm/yy',
                timeFormat: 'hh:mm TT'
            });

            // Tags Input
            this.$('.tagsinput').tagsInput();

        },

        unrender: function () {
            this.remove();
        }
    });

    return PostView;
});