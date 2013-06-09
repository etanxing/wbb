/*global define*/

define([
    'jquery',
    'backbone',
    'text!../templates/listtag.html',
    'humane'
], function ($, Backbone, listtag, humane) {
    'use strict';

    var PostView = Backbone.View.extend({
        tagName : 'tr',

        className : 'listtag',

        events : {
            'click .tag-edit' : 'edit',
            'submit form' : 'update',
            'click #tag-edit-cancel' : 'cancel'
        },

        initialize : function() {
            this.listenTo(this.model, 'remove', this.remove);
            this.listenTo(this.model, 'change', this.cancel);
        },

        render: function(edit) {
            this.$el.html(_.template(listtag)({
                tag  : this.model.toJSON(),
                edit : edit || false
            }))

            return this;
        },

        edit : function() {
            this.render(true);
        },

        cancel : function() {
            this.render();
        },

        update : function (e) {
            humane.log('Updating Tag')
            e.preventDefault();
            this.model.save({
                taxonomy : this.$('input')[0].value,
                slug : this.$('input')[1].value
            }, {
                wait: true,
                error : function (resp) {
                    humane.log(resp);
                },
                success : function() {
                    humane.log('Successfully updated.')
                }
            })
        }
    });

    return PostView;
});