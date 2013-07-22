/*global define*/

define([
    'underscore',
    'backbone',
    '../common',
    '../utils/validate',
    'moment'
], function (_, Backbone, Common, Validate, moment) {
    'use strict';

    var Post = Backbone.Model.extend({
        idAttribute: "_id",

        defaults: {
            'title'  : '',
            'slug'   : '',
            'content': '',
            'status' : 3,
            'type'   : 1,
            'date'   : moment().format('DD/MM/YYYY hh:mm A'),
            'tags'   : [],
            'password':''
        },

        info: function(selectname) {
            var info = {
                textfields: ['title'],

                selects : [{ field : 'type', data : [['All', -1],['Post', 1], ['Page', 2]] }, 
                           { field : 'status', data: [['All', -1],['Published', 1], ['Password', 2], ['Draft', 3]] }],
                filter : [
                    //default filter
                    {field: 'status', type: 'min', value: -1 },
                    {field: 'type', type:'equalTo', value: 1 },
                    {field: 'title', type: 'pattern', value: new RegExp('', 'igm')}],
            }

            if (selectname) return _.find(info.selects, function(select) { return select.field === selectname}).data;

            return info;
        },

        initialize : function (){

        },

        validate : function () {
            var errors = Validate.validate.call(this.toJSON(), 'post');
            if (errors.length > 0) return errors;
        },

        urlRoot : function() {
            return Common.server + '/admin/api/post';
        }
    });

    return Post;
});