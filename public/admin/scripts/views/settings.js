/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',    
    '../common',
    '../views/listsetting',
    '../views/navigation',
    'text!../templates/settings.html',
    'humane'
], function ($, _, Backbone, Common, ListSettingView, NavigationView, settings, humane) {
    'use strict';

    var SettingsView = Backbone.View.extend({        
        className: 'settings-view',

        events : {
            'click .listsetting a' : 'setting',
            'keyup .search-query' : 'search',
            'change #checkallup'  : 'checkall',
            'change #checkalldown': 'checkall',
            'change th.checkbox input' : 'toggleDelete',
            'click .setting-delete'   : 'deleteSettings',
            'click #settings-delete'  : 'deleteSettings'
        },

        initialize: function() {
            _.bindAll(this, 'addAll', 'addOne', 'renderNavigation', 'search', 'checkall', 'removeModelfromCollection');
            this.listenTo(this.collection, 'reset', this.addAll);
        },

        render : function() {           
            this.$el.html(settings);
            this.collection.fetch({
                success: this.renderNavigation,
                silent:true,
                error : function(collection, resp, options) {
                    var err = JSON.parse(resp.responseText);
                    humane.log(err.msg);                    
                }
            });

            return this;
        },

        addAll : function() {
            var info = this.collection.info();
            this.$('#settings-delete').toggle(false);
            this.$('.settinglist')
            //.toggleClass('status', info.filters[0].value === -1 )
            //.toggleClass('type', info.filters[1].value === -1)
            .find('tbody').empty();

            this.collection.each(this.addOne);
            this.collection.models.length === 0 && this.$('.settinglist tbody').html('<tr><td colspan="7" style="text-align:center;">No settings found.</td></tr>');
        },

        addOne: function (setting) {
            var view = new ListSettingView({model:setting});
            this.$('.settinglist tbody').append(view.render().el);
        },

        renderNavigation : function () {
            var info = (new this.collection.model).info();
            this.collection.origModels = undefined;
            this.collection.setFieldFilter(info.filter);
            this.navigationViewUp = new NavigationView({collection : this.collection, className : 'navigation up'}),
            this.navigationViewDown = new NavigationView({collection : this.collection, className : 'navigation down'});
            this.navigationViewUp.info = this.navigationViewDown.info = info;
            this.$('.actions')
            .before(this.navigationViewUp.render().el);
            this.$('.settinglist')
            .after(this.navigationViewDown.render().el);                
        },

        unrender : function () {
            this.navigationViewUp.remove();
            this.navigationViewDown.remove();
            this.$el.detach();            
        },

        search : function(e) {
            this.navigationViewUp.filter();
        },

        setting : function(e) {
            Backbone.history.navigate(e.target.pathname, true);
            return false;
        },

        checkall : function (e) {
            var checked = e.target.checked;
            this.$('.checkbox input:' + (checked?'not(:checked)':'checked')).map(function() {
                return this.checked = checked;
            })        
        },

        toggleDelete : function (e) {
            this.$('#settings-delete').toggle(this.$('tbody .checkbox input:checked').length > 0);
        },

        deleteSettings : function(e) {            
            var mutli = e.target.id === 'settings-delete',
                tobedeletedIDs = [],
                self = this,
                r=confirm('You are about to permanently delete the selected items.\n\'Cancel\' to stop, \'OK\' to delete.');
            if ( r=== true) {
                humane.log('Deleting.');
                if (mutli) {
                    this.$('tbody .checkbox input:checked').each(function(){
                        tobedeletedIDs.push(this.id);
                    });
                } else {
                    tobedeletedIDs.push($(e.target).data('id'));
                }

                $.ajax({
                    type : 'delete',
                    url : '/admin/api/settings', 
                    data : { ids : tobedeletedIDs },
                    success : this.removeModelfromCollection,
                    error : this.errorhandler
                })
            }
        },

        removeModelfromCollection : function(ids) {
            var self = this,
                models = _.map(ids, function(id){
                    return self.collection.get(id);
                });

            this.collection
            .remove(models)
            .pager();

            humane.log('Successfully deleted.');
        },

        errorhandler : function (resp) {
            var err;
            try {
                err = JSON.parse(resp.responseText);    
            } catch(e) {
                err = { msg : 'unknown error, please try later.'}
            }
            
            humane.log(err.msg);
        }
    });

    return SettingsView;
});