/*global define*/

define([
    'underscore',
    'backbone',
    '../common'
], function (_, Backbone, Common) {
    'use strict';

    var Setting = Backbone.Model.extend({
        idAttribute: "_id",
        defaults: {
            'name'  : '',
            'value' : '',
            'system': 2,
            'onload': 2
        },

        info: function() {
            var info = {
                textfields: ['name'],

                selects : [{ field : 'onload', data : [['All', -1],['Onload', 1], ['Non-onload', 2]] }, 
                           { field : 'system', data: [['All', -1],['System', 1], ['Non-system', 2]]}],
                filter : [
                    //default filter
                    {field: 'onload', type: 'min', value: -1 },
                    {field: 'system', type:'min', value: -1 },
                    {field: 'name', type: 'pattern', value: new RegExp('', 'igm')}],
            }

            return info;
        },
        urlRoot : function() {
            return Common.server + '/admin/api/setting';
        }
    });

    return Setting;
});