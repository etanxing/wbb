/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
], function ($, _, Backbone) {
    'use strict';

    var app = (function () {
        var _server = '', //http://wbb.ap01.aws.af.cm/
            _router = '',
        	_status = new Backbone.Model({
        		processing : false,
                router : ''
        	}),
        	_settings = new Backbone.Model();

        var _options = {
        	loading : function (status, options) {
                $('html,body').animate({scrollTop: 0 }, $('body').scrollTop()/4 , function() {
                    $('body').toggleClass('processing', status.get('processing'));
                });
        	},

        	onload : function (model, response, options) {
        		console.log('default onload');
        	}
        }

        var _init = function (options) {        	
            var opts = _.defaults(options || {}, _options);
            _status.on('change:processing', opts.loading);
            _settings.fetch({
            	url: _server + 'api/settings',
            	success : function(model) {
            		opts.onload(model);
            	}
            });
        };

        return {
            status: {
            	set : function (name, value) {
            		_status.set(name, value);
            	},

            	get : function (name) {
            		return _status.get(name);
            	}
            },

            init: function (options) {
                _init(options);
                this.Settings = _settings;
            },

            server : _server //http://localhost:7777
        };    
    })();

    return app;
});