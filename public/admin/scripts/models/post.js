/*global define*/

define([
    'underscore',
    'backbone',
    '../common'
], function (_, Backbone, Common) {
    'use strict';

    var Post = Backbone.Model.extend({
        idAttribute: "_id",

        schema: {
            title    : 'Text',
            slug     : 'Text',
            status   : { type: 'Select', options: [ { val: 1, label: 'Published' }, 
                                                    { val: 2, label: 'Draft' }, 
                                                    { val: 3, label: 'Password' }]},
            type     : { type: 'Select', options: [ { val: 1, label: 'Post' },
                                                    { val: 2, label: 'Page' } ]},
            date     : 'DateTime',
            content  : 'TextArea',
            password : 'Password',
            tags     : 'Text'
        },

        urlRoot : function() {
            return Common.server + '/admin/api/post';
        }
    });

    return Post;
});