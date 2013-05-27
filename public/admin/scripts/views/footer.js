/*global define*/

define([
    'jquery',
    'backbone',
    'text!../templates/footer.html'
], function ($, Backbone, footer) {
    'use strict';

    var FooterView = Backbone.View.extend({
        el : 'footer',

        render: function() {
            $(this.el)
            .html(footer)
        }
    });

    return FooterView;
});