/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'text!../templates/listpost.html',
    'moment'
], function ($, _, Backbone, listpost, moment) {
    'use strict';

    var PostView = Backbone.View.extend({
        tagName : 'tr',

        className : 'listpost',

        render: function() {
            this.$el.html(_.template(listpost)({
                post  : this.model.toJSON(),
                type  : this.model.info('type'),
                status: this.model.info('status')
            }))

            return this;
        }
    });

    return PostView;
});