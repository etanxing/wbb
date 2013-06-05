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
            'click .refine a': 'filter'
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

        filter: function (e) {
            e && e.preventDefault();

            var rules = [],
                // Separate search query that supports multi-words
                words = _.map($('#search-query').val().match(/\w+/ig), function(element) { return element.toLowerCase(); }),
                // Generate pattern for filtering
                pattern = '(' + _.uniq(words).join('|') + ')',
                // Get last selected status
                laststatus = this.$('.refinestatus a.active').data('status'),
                // Get last selected type
                lasttype = this.$('.refinetype a.active').data('type'),
                // e.target
                item,
                // Get currect status
                status,
                // Get current type
                type;

            if (!e) {
                // Key words search
                rules.push({ field: 'status', type: laststatus === -1 ?'min':'equalTo', value: laststatus },
                           { field: 'type', type: lasttype === -1 ? 'min':'equalTo', value: lasttype },
                           { field: 'title', type: 'pattern', value: new RegExp(pattern, 'igm')});
            } else {
                //Filter Status & Type                
                item = e.target;
                status = $(item).data('status');
                type = $(item).data('type');

                if (status) {
                    rules.push({ field: 'status', type: status === -1 ?'min':'equalTo', value: status },
                               { field: 'type', type: lasttype === -1 ? 'min':'equalTo', value: lasttype },
                               { field: 'title', type: 'pattern', value: new RegExp(pattern, 'igm')});
                } else {
                    rules.push({ field: 'status', type: laststatus === -1 ?'min':'equalTo', value: laststatus },
                               { field: 'type', type: type === -1 ? 'min':'equalTo', value: type },
                               { field: 'title', type: 'pattern', value: new RegExp(pattern, 'igm')});
                }    
            }       
            
            this.collection.setFieldFilter(rules);
        }
    });

    return NavigationView;
});