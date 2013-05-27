/*global define*/

define([
    'underscore',
    'backbone',
    'models/setting',
    '../common',
    'paginator'
], function (_, Backbone, Setting, Common) {
    'use strict';

	var Settings = Backbone.Paginator.clientPager.extend({
		model : Setting,
		paginator_core: {
			type: 'GET',
			dataType: 'json',
			url: Common.server + 'api/settings'
		},

		paginator_ui: {
			firstPage: 1,
			currentPage: 1,
			perPage: 3,
			totalPages: 10
		}
	});

    return Settings;
});