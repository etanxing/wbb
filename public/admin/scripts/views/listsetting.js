/*global define*/

define([
    'jquery',
    'backbone',
    'text!../templates/listsetting.html',
    'moment'
], function ($, Backbone, listsetting, moment) {
    'use strict';

    var PostView = Backbone.View.extend({
        tagName : 'tr',

        className : 'listsetting',

        render: function() {
            this.$el.html(_.template(listsetting)({
                setting  : this.model.toJSON(),
                onload   : ['Yes', 'No'],
                system   : ['Yes', 'No']
            }))

            return this;
        }
    });

    return PostView;
});