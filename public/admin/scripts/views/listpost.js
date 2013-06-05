/*global define*/

define([
    'jquery',
    'backbone',
    'text!../templates/listpost.html',
    'moment'
], function ($, Backbone, listpost, moment) {
    'use strict';

    var PostView = Backbone.View.extend({
        tagName : 'tr',

        className : 'listpost',

        render: function() {
            this.$el.html(_.template(listpost)({
                post  : this.model.toJSON(),
                status: ['Published', 'Password', 'Draft'],
                type  : ['Post', 'Page']
            }))

            return this;
        }
    });

    return PostView;
});