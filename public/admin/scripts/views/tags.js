/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',    
    '../common',
    '../views/listtag',
    '../views/navigation',
    'text!../templates/tags.html',
    'humane'
], function ($, _, Backbone, Common, ListTagView, NavigationView, tags, humane) {
    'use strict';

    var TagsView = Backbone.View.extend({        
        className: 'tags-view',

        events : {
            'click .listtag a'    : 'tag',
            'keyup .search-query' : 'search',
            'submit .actions'     : 'addTags',
            'click th a'          : 'sortby',
            'change #checkallup'  : 'checkall',
            'change #checkalldown': 'checkall',
            'change th.checkbox input' : 'toggleDelete',
            'click .tag-delete'   : 'deleteTags',
            'click #tags-delete'  : 'deleteTags'
        },

        initialize: function() {
            _.bindAll(this, 'addAll', 'addOne', 'renderNavigation', 'search', 'addModeltoCollection', 
                'sortby', 'checkall', 'removeModelfromCollection');
            this.listenTo(this.collection, 'reset', this.addAll);
        },

        render : function() {           
            this.$el.html(tags);
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
            this.$('#tags-delete').toggle(false);
            this.$('.taglist')
            .find('tbody').empty();

            this.collection.each(this.addOne);
            this.collection.models.length === 0 && this.$('.taglist tbody').html('<tr><td colspan="4" style="text-align:center;">No tags or pages found.</td></tr>');
        },

        addOne: function (tag) {
            var view = new ListTagView({model:tag});
            this.$('.taglist tbody').append(view.render().$el);
        },

        renderNavigation : function () {          
            var info = (new this.collection.model).info();
            this.collection.setFieldFilter(info.filter);
            //this.collection.setSort(info.sortby, info.direct);              
            this.navigationViewUp = new NavigationView({collection : this.collection, className : 'navigation up'}),
            this.navigationViewDown = new NavigationView({collection : this.collection, className : 'navigation down'});
            this.navigationViewUp.info = this.navigationViewDown.info = info;
            this.$('.actions')
            .before(this.navigationViewUp.render().el);
            this.$('.taglist')
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

        tag : function(e) {
            Backbone.history.navigate(e.target.pathname, true);
            return false;
        },

        addTags : function(e) {
            humane.log('Adding tags');
            e.preventDefault();
            var newtags = this.$('#newTags').val().split(',');
            $.ajax({
                type : 'post',
                url : '/admin/api/tags', 
                data : { newtags : _.map(newtags, function (newtag) {
                    return newtag.replace(/^\s+|\s+$/g,'');
                })},
                success : this.addModeltoCollection,
                error : this.errorhandler
            })
        },
        
        addModeltoCollection: function(newtags) {
            this.$('#newTags').val('');
            humane.log('Successfully add');
            this.collection.add(newtags);
            this.collection.pager();
        },

        sortby : function(e) {
            var item = e.target.tagName === 'A'? e.target : e.target.parentNode,
                col = $(item).text().toLowerCase(),
                reverse = $(item).has('i').length === 1,
                updirection = $(item).children().hasClass('icon-chevron-sign-up');

            if (reverse) {
                $(item).children()
                .toggleClass('icon-chevron-sign-up', !updirection)
                .toggleClass('icon-chevron-sign-down', updirection);                
            } else {
                $(item).append('<i class="icon-large icon-chevron-sign-up"></i>');
                $(item).parent().siblings().find('i').remove();
            }

            this.collection.setSort(col, updirection ?'asc':'desc');
        },

        deleteTags : function(e) {            
            var mutli = e.target.id === 'tags-delete',
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
                    url : '/admin/api/tags', 
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

        checkall : function (e) {
            var checked = e.target.checked;
            this.$('.checkbox input:' + (checked?'not(:checked)':'checked')).map(function() {
                return this.checked = checked;
            })        
        },

        toggleDelete : function (e) {
            this.$('#tags-delete').toggle(this.$('tbody .checkbox input:checked').length > 0);
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

    return TagsView;
});