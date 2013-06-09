/*global define*/

define([
    'underscore',
    'backbone',
    '../common'
], function (_, Backbone, Common) {
    'use strict';

    var Tag = Backbone.Model.extend({
        idAttribute: "_id",

        defaults: {
            'taxonomy'  : '',
            'slug'   : '',
            'count'   : 1
        },

        urlRoot : function() {
            return Common.server + '/admin/api/tag';
        },
        info : function() {
            return { selects : [], 
                     filter : [], 
                     textfields: ['taxonomy'],
                     sortby : 'count',
                     direct : 'desc'
            };
        }
    });

    return Tag;
});