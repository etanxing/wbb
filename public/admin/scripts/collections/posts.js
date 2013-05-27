/*global define*/

define([
    'underscore',
    'backbone',
    'models/post',
    '../common',
    'paginator'
], function (_, Backbone, Post, Common) {
    'use strict';

    // var Posts = Backbone.Collection.extend({
    //     model: Post,
    //     url : 'http://localhost:7777/api/items'
    // });

	var Posts = Backbone.Paginator.clientPager.extend({
		model : Post,
		paginator_core: {
			type: 'GET',
			dataType: 'json',
			url: Common.server + 'api/posts'
		},

		paginator_ui: {
			firstPage: 1,
			currentPage: 1,
			perPage: 5,
			totalPages: 10
		}
	});

    return Posts;
});