/*global define*/

define([
    'datetimepicker',
    'underscore',
    'Backbone.Stickit',
    'moment',
    '../models/post',
    'text!../templates/post.html',
    'humane',
    'tagsinput'
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
            '#date'   : {
                observe: 'date',
                onGet: function (date) {
                    return moment(date).format("DD/MM/YYYY hh:mm A");
                }
            },
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

            if (id) {
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
            this.$el.detach();
        },

        update : function (e) {
            this.$('.control-group').removeClass('error');
            
            this.model.save({
                // 'title'  : this.$('#title').val(),
                // 'slug'   : this.$('#slug').val(),
                // 'content': this.$('#content').val(),
                // 'status' : this.$('#status').val(),
                // 'date'   : this.$('#date').val(),
                // 'type'   : this.$('#type').val(),
                // 'tags'   : this.$('#tags').val(),
            }, {
                wait : true,
                success : function () {
                    alert('success');
                },
                error: function () {
                    alert('failed to save');
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