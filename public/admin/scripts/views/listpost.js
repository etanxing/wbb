/*global define*/

define([
    'jquery',
    'backbone',
    'text!../templates/listpost.html'
], function ($, Backbone, listpost) {
    'use strict';

    var PostView = Backbone.View.extend({
        tagName : 'li',

        className : 'listpost',

        render: function() {
            this.$el.html(_.template(listpost)({
                post  : this.model.toJSON()
            }))

            return this;
        }
    });

    return PostView;
});