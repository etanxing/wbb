/*global define*/

define([
    'jquery',
    'backbone',
    'text!../templates/navigation.html'
], function ($, Backbone, navigation) {
    'use strict';

    var NavigationView = Backbone.View.extend({       
        events: {
            'click a.first': 'gotoFirst',
            'click .previous': 'gotoPrev',
            'click .next': 'gotoNext',
            'click a.last': 'gotoLast',
            'click a.page': 'gotoPage',
            'click .howmany a': 'changeCount',
            'click .refine li ': 'filter'
        },

        initialize: function () {
            this.collection.on('reset', this.render, this);
        },

        render : function(options){
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

        filter: function (e) {
            e.preventDefault();

            var item = e.target.tagName === 'LI'?e.target:e.target.parentNode,
                status = $(item).data('status'),
                type = $(item).data('type'),
                laststatus = this.$('.refinestatus li.active').data('status'),
                lasttype = this.$('.refinetype li.active').data('type'),
                rules = [];

            if (status) {
                rules.push({ field: 'status', type: status === -1 ?'min':'equalTo', value: status },
                           { field: 'type', type: lasttype === -1 ? 'min':'equalTo', value: lasttype });
            } else {
                rules.push({ field: 'status', type: laststatus === -1 ?'min':'equalTo', value: laststatus },
                           { field: 'type', type: type === -1 ? 'min':'equalTo', value: type });
            }            
            
            this.collection.setFieldFilter(rules);
        }
    });

    return NavigationView;
});