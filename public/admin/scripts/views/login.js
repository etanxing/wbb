/*global define*/

define([
    'jquery',
    'backbone',
    'text!../templates/login.html'
], function ($, Backbone, login) {
    'use strict';

    var LoginView = Backbone.View.extend({
        className : 'login-view',

        events : {
            'click #btn-login' : 'dashboard'
        },

        render: function() {
            $(this.el)
            .html(login)

            return this;
        },

        dashboard : function() {
            //Verify creadsds
            Backbone.history.navigate('admin/dashboard', true);
            return false;
        },

        unrender: function() {
            this.$el.detach();
        }
    });

    return LoginView;
});