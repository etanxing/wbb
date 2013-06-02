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
        paginator : 'vendor/backbone.paginator',
        stickit   : 'vendor/backbone.stickit',
        moment : '../bower_components/moment/moment',
        humane : '../bower_components/humane-js/humane.min'
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