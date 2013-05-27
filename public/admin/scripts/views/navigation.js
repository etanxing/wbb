/*global define*/

define([
    'jquery',
    'backbone',
    'text!../templates/navigation.html'
], function ($, Backbone, navigation) {
    'use strict';

    var NavigationView = Backbone.View.extend({
        className : 'navigation',
        
        events: {
            'click a.first': 'gotoFirst',
            'click a.prev': 'gotoPrev',
            'click a.next': 'gotoNext',
            'click a.last': 'gotoLast',
            'click a.page': 'gotoPage',
            'click .howmany a': 'changeCount',
            'click a.filter': 'filter'
        },

        initialize: function () {
            this.collection.on('reset', this.render, this);
        },

        render : function(){
            this.$el.html(_.template(navigation)(this.collection.info()));

            return this;
        },

        unrender : function(){
            this.$el.detach();
        },

        gotoFirst: function (e) {
            e.preventDefault();
            this.collection.goTo(1);
        },

        gotoPrev: function (e) {
            e.preventDefault();
            this.collection.previousPage();
        },

        gotoNext: function (e) {
            e.preventDefault();
            this.collection.nextPage();
        },

        gotoLast: function (e) {
            e.preventDefault();
            this.collection.goTo(this.collection.information.lastPage);
        },

        gotoPage: function (e) {
            e.preventDefault();
            var page = $(e.target).text();
            this.collection.goTo(page);
        },

        changeCount: function (e) {
            e.preventDefault();
            var per = $(e.target).text();
            this.collection.howManyPer(per);
        },

        getFilterField: function () {
            return $('#filterByOption').val();
        },

        getFilterValue: function () {
            return $('#filterString').val();
        },

        preserveFilterField: function (field) {
            $('#filterByOption').val(field);
        },

        preserveFilterValue: function (value) {
            $('#filterString').val(value);
        },

        filter: function (e) {
            e.preventDefault();

            var fields = this.getFilterField();
            /*Note that this is an example! 
             * You can create an array like 
             * 
             * fields = ['Name', 'Description', ...];
             *
             *Or an object with rules like
             *
             * fields = {
             *              'Name': {cmp_method: 'levenshtein', max_distance: 7}, 
             *              'Description': {cmp_method: 'regexp'},
             *              'Rating': {} // This will default to 'regexp'
             *          };
             */

            var filter = this.getFilterValue();
            
            this.collection.setFilter(fields, filter);
            this.collection.pager();

            this.preserveFilterField(fields);
            this.preserveFilterValue(filter);
        }
    });

    return NavigationView;
});