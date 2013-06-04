/*global define*/

define([
    'datetimepicker',
    'underscore',
    'backbone',
    'moment',
    '../models/post',
    'text!../templates/post.html',
    'humane',
    'tagsinput',
    'stickit'
], function ($, _, Backbone, moment, Post, post, humane) {
    'use strict';

    var PostView = Backbone.View.extend({
        className : 'post-view',

        events : {
            'submit form'   : 'update',
            'click #submit' : 'update'
        },

        bindings: {
            '#title'  : 'title',
            '#slug'   : 'slug',
            '#date'   : 'date',
            '#content': 'content',
            '#status' : {
                observe: 'status',
                selectOptions:{
                    collection:[{value: 1, label:'Published' }, 
                                {value: 2, label:'Password' },
                                {value: 3, label:'Draft'}]
                }
            },
            '#type' : {
                observe: 'type',
                selectOptions:{
                    collection:[{value: 1, label:'Post' }, 
                                {value: 2, label:'Page' }]
                }
            },
            '#tags' : {
                observe: 'tags',
                onGet: function (tags) {
                    return tags.join(',');
                },
                onSet: function (tags) {
                    return tags.split(',');
                }
            }
        },

        initialize: function() {
            _.bindAll(this, 'renderPost');
        },

        render: function(id) {
            this.model = new Post();            
            this.listenTo(this.model, 'invalid', this.showErrors)

            if (!_.isArray(id) && id.length > 0 && id[0] ) {
                this.model.set('_id', id);
                this.model.fetch({ success : this.renderPost });
            } else {
                this.renderPost();
            }

            return this;
        },

        renderPost: function() {
            this.$el.html(_.template(post)({
                isNew : this.model.isNew()
            }));

            //Refomat existing post's date
            if (!this.model.isNew()) 
                this.model.set('date', moment(this.model.get('date'), 'YYYY-MM-DDTHH:mm:ss Z').format('DD/MM/YYYY hh:mm A'));

            //Binding model and form input
            this.stickit();

            // Tags Input
            //this.$('.tagsinput').tagsInput();

            this.$('#date').datetimepicker({
                hourGrid: 6,
                minuteGrid: 10,
                dateFormat: 'dd/mm/yy',
                timeFormat: 'hh:mm TT',
                ampm: true
            });
        },

        unrender: function () {
            this.$('#date').datetimepicker('destroy');

            //Unbinding model and form input
            this.unstickit();

            //Clear form
            this.$('.control-group input, .control-group textarea').val('');
            //Remove from doc temp
            this.$el.detach();
        },

        update : function (e) {
            var isNew = this.model.isNew();
            this.$('.control-group').removeClass('error');
            humane.log((isNew?'Sav':'Updat') + 'ing Post');
            this.model.save({}, {
                wait : true,
                success : function () {
                    humane.log('Successfully ' + (isNew?'save':'update'));
                },
                error: function () {
                    humane.log('Failed to ' + (isNew?'save':'update'));
                }
            })
        },

        showErrors : function (model, errors) {
            var self = this,
                msg = [],
                errors = _.filter(errors, function(error) { return error.err });

            _.each(errors, function (error) {
                self.$('#' + error.attr)
                .parent('.control-group').addClass('error'); 
                _.each(error.msg, function(errmsg) { msg.push(errmsg)});
            })

            humane.log(msg);
        }
    });

    return PostView;
});