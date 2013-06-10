/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    '../models/setting',
    'text!../templates/setting.html',
    'humane',
    'tagsinput',
    'stickit'
], function ($, _, Backbone, Setting, setting, humane) {
    'use strict';

    var SettingView = Backbone.View.extend({
        className : 'setting-view',

        events : {
            'submit form'   : 'update',
            'click .heckbox-slide' : 'toggleSwitch'
        },

        bindings: {
            '#name'   : 'name',
            '#value'  : 'value',
            '#system' : {
                observe: 'system',
                onGet : function(system) {
                    return system === 1
                },
                onSet : function(val) {
                    return val?1:2;
                },
                initialize : function($el) {
                    $el.parent().toggleClass('switch-on', $el[0].checked);
                },
                getVal : function($el) {
                    $el.parent().toggleClass('switch-on', $el[0].checked);
                    return $el[0].checked;
                }
            },
            '#onload' : {
                observe : 'onload',
                onGet : function(onload) {
                    return onload === 1;
                },
                onSet : function (val) {
                    return val?1:2;
                },
                initialize : function($el) {
                    $el.parent().toggleClass('switch-on', $el[0].checked);
                },
                getVal : function($el) {
                    $el.parent().toggleClass('switch-on', $el[0].checked);
                    return $el[0].checked;
                }
            }
        },

        initialize: function() {
            _.bindAll(this, 'renderSetting');
        },

        render: function(id) {         
            this.model = new Setting();            
            this.listenTo(this.model, 'invalid', this.showErrors)

            if (_.isArray(id) && id.length > 0 && id[0] ) {
                this.model.set('_id', id);
                this.model.fetch({ success : this.renderSetting });
            } else {
                this.renderSetting();
            }

            return this;
        },

        renderSetting: function() {
            this.$el.html(_.template(setting)({
                isNew : this.model.isNew()
            }));

            //Binding model and form input
            this.stickit();
        },

        unrender: function () {
            //Unbinding model and form input
            this.unstickit();

            //Clear form
            this.$('.control-group input, .control-group textarea').val('');
            //Remove from doc temp
            this.$el.detach();
        },

        update : function (e) {
            e.preventDefault();

            var isNew = this.model.isNew();
            this.$('.control-group').removeClass('error');
            humane.log((isNew?'Sav':'Updat') + 'ing Setting');
            this.model.save({}, {
                wait : true,
                success : function () {
                    humane.log('Successfully ' + (isNew?'save':'update'));
                },
                error: function () {
                    humane.log('Failed to ' + (isNew?'save':'update'));
                }
            })
        },

        showErrors : function (model, errors) {
            var self = this,
                msg = [],
                errors = _.filter(errors, function(error) { return error.err });

            _.each(errors, function (error) {
                self.$('#' + error.attr)
                .parent('.control-group').addClass('error'); 
                _.each(error.msg, function(errmsg) { msg.push(errmsg)});
            })

            humane.log(msg);
        }
    });

    return SettingView;
});