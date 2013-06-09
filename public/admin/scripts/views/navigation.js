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
            this.$el.html(_.template(navigation)({
                info   : this.collection.info(),
                filter : this.info
            }));

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

            var self = this,
                rules = [],
                // Separate search query that supports multi-words
                words = _.map($('#search-query').val().match(/\w+/ig), function(element) { return element.toLowerCase(); }),
                // Generate pattern for filtering
                pattern = '(' + _.uniq(words).join('|') + ')',
                // Store last selected values
                lastfilter = {},
                // Stoe current selected values
                currentfilter = {},
                // e.target
                item,
                // 
                fieldname;

            if (this.info) {
                // Set last selected values
                _.each(this.info.selects, function (select) {
                    lastfilter[select.field] = self.$('.select' + select.field + ' a.active').data('item');
                });

                // Generate current rules
                _.each(this.info.selects, function (select) {
                    rules.push({
                        field : select.field,
                        type  : lastfilter[select.field] === -1 ?'min':'equalTo',
                        value : lastfilter[select.field]
                    })
                });

                _.each(this.info.textfields, function(textfield) {
                    rules.push({ field: textfield, type: 'pattern', value: new RegExp(pattern, 'igm')});  
                });
            }

            //If it's not a keyword search, update rules
            if (e) {
                // Find out which field is clicked               
                item = e.target;
                fieldname = $(item).parent().data('select');

                _.each(rules, function (rule) {
                    if (rule.field === fieldname) {
                        rule.value = $(item).data('item');
                        rule.type = rule.value === -1 ?'min':'equalTo';
                    }
                });  
            }
 
            if (this.info) this.info.filter = rules;
            this.collection.setFieldFilter(rules);
        }
    });

    return NavigationView;
});