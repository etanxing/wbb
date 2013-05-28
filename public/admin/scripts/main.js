/*global require*/
'use strict';

require.config({
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        paginator : {
            deps : ['backbone'],
            exports : 'Backbone.Paginator'
        },

        'Backbone.Stickit' : {
            deps: ['backbone'],
            exports: 'Backbone'
        },
        'jquery-ui': {
            deps: ['jquery'],            
            exports: 'jquery'
        },
        datetimepicker : {
            deps: ['jquery-ui'],
            exports: 'jquery'
        },
        tagsinput : {
            deps: ['jquery'],
            exports: 'jquery'
        }
    },
    paths: {
        jquery: '../bower_components/jquery/jquery',
        'jquery-ui' : '../bower_components/jquery-ui/ui/jquery-ui',
        datetimepicker : '../bower_components/jquery-timepicker-addon/jquery-ui-timepicker-addon',
        tagsinput : '../bower_components/Flat-UI/js/jquery.tagsinput',
        backbone: '../bower_components/backbone-amd/backbone',
        underscore: '../bower_components/underscore-amd/underscore',
        text: '../bower_components/requirejs-text/text',
        paginator : '../bower_components/backbone.paginator/lib/backbone.paginator',
        'Backbone.Stickit' : '../bower_components/backbone.stickit/backbone.stickit',
        moment : '../bower_components/moment/moment'
    }
});

require([
    'backbone',
    'routes/router'
], function (Backbone, Router) {
    new Router;
    Backbone.history.start({pushState: true});
    console.log('arrived.');
});