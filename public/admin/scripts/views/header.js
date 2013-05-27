/*global define*/

define([
    'jquery',
    'backbone',
    'text!../templates/header.html'
], function ($, Backbone, header) {
    'use strict';

    var HeaderView = Backbone.View.extend({
        el : 'header',

        events : {
            'click .nav-menu a' : 'navigate'
        },

        render: function() {
        	$(this.el)
        	.html(header)
        },

        navigate : function(e) {
            Backbone.history.navigate(e.target.title, true);
            return false;
        }
    });

    return HeaderView;
});