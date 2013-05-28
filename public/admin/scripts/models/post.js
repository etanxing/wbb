/*global define*/

define([
    'underscore',
    'backbone',
    '../common'
], function (_, Backbone, Common) {
    'use strict';

    var Post = Backbone.Model.extend({
        idAttribute: "_id",

        defaults: {
            'title'  : '',
            'content': '',
            'status' : 3,
            'type'   : 1,
            'date'   : new Date,
            'tags'   : []
        },

        validate : function (attrs) {
            var errors = [];

            if (attrs.title.length > 10) {
                errors.push({
                    attr : 'title',
                    err  : true,
                    msg  : 'Title is too long'
                });
            }

            //return errors;
        },

        urlRoot : function() {
            return Common.server + '/admin/api/post';
        }
    });

    return Post;
});