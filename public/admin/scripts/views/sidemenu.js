/*global define*/

define([
    'jquery',
    'backbone',
    'text!../templates/sidemenu.html'
], function ($, Backbone, sidemenu) {
    'use strict';

    var Sidemenu = Backbone.View.extend({
        tagName : 'aside',

        className : 'sidemenu',

        events : {
            'click a' : 'navigate'
        },

        render: function() {
            $(this.el)
            .html(sidemenu)

            return this
        },

        unrender: function() {
            this.$el.datach();
        },

        navigate : function(e) {
            Backbone.history.navigate('admin/posts', true);
            return false;
        }
    });

    return Sidemenu;
});