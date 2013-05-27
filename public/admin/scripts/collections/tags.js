/*global define*/

define([
    'underscore',
    'backbone',
    'models/tag',
    '../common',
    'paginator'
], function (_, Backbone, Tag, Common) {
    'use strict';

	var Tags = Backbone.Paginator.clientPager.extend({
		model : Tag,
		paginator_core: {
			type: 'GET',
			dataType: 'json',
			url: Common.server + 'api/tags'
		},

		paginator_ui: {
			firstPage: 1,
			currentPage: 1,
			perPage: 3,
			totalPages: 10
		}
	});

    return Tags;
});