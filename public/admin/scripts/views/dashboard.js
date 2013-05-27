/*global define*/

define([
    'jquery',
    'backbone',
    'text!../templates/dashboard.html'
], function ($, Backbone, dashboard) {
    'use strict';

    var DashboardView = Backbone.View.extend({
        className : 'dashboard-view',

        initialize: function() {
            _.bindAll(this, 'update');
        },

        render: function() {
            $.getJSON('api/data', this.update);

            return this;
        },

        unrender: function() {
            this.$el.detach();
        },

        update: function(counters) {
            console.log('update fired.');

            this.$el.html(_.template(dashboard)({
                counters  : counters
            }));
        }
    });

    return DashboardView;
});