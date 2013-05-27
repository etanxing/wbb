/*global define*/

define([
    'underscore',
    'backbone',
    '../common'
], function (_, Backbone, Common) {
    'use strict';

    var Setting = Backbone.Model.extend({
        idAttribute: "_id",
        url : function() {
        	return Common.server + 'api/item/slug/' + this.get('slug')
        }
    });

    return Setting;
});