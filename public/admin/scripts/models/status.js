/*global define*/

define([
    'underscore',
    'backbone',
], function (_, Backbone) {
    'use strict';

    var app = (function () {
        var myPrivateVar = 0;
        var myPrivateMethod = function (someText) {
            console.log(someText);
        };

        return {
            myPublicVar: "foo",
            myPublicFunction: function (bar) {
                myPrivateVar++;
                myPrivateMethod(bar);
            }
        };    
    })();
});