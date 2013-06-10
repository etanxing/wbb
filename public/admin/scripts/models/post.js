/*global define*/

define([
    'underscore',
    'backbone',
    '../common',
    'moment'
], function (_, Backbone, Common, moment) {
    'use strict';

    var Post = Backbone.Model.extend({
        idAttribute: "_id",

        defaults: {
            'title'  : '',
            'slug'   : '',
            'content': '',
            'status' : 3,
            'type'   : 1,
            'date'   : moment().format('DD/MM/YYYY hh:mm A'),
            'tags'   : [],
            'password':''
        },

        info: function(selectname) {
            var info = {
                textfields: ['title'],

                selects : [{ field : 'type', data : [['All', -1],['Post', 1], ['Page', 2]] }, 
                           { field : 'status', data: [['All', -1],['Published', 1], ['Password', 2], ['Draft', 3]] }],
                filter : [
                    //default filter
                    {field: 'status', type: 'min', value: -1 },
                    {field: 'type', type:'equalTo', value: 1 },
                    {field: 'title', type: 'pattern', value: new RegExp('', 'igm')}],
            }

            if (selectname) return _.find(info.selects, function(select) { return select.field === selectname}).data;

            return info;
        },

        validations : {
            title   : {
                required : true
            },

            slug    : {
                required : true
            },

            content : {
                required : true
            },

            status  : {
                range    : [1, 3]
            },

            type: {
                range    : [1, 2]
            },

            date : {
                required : true,
                datetime : true
            }
        },

        validationExpressions : {
            required : function(attrname, value) {
                if (_.isNull(value) || _.isUndefined(value) || (_.isString(value) && value.replace(/^\s+|\s+$/g,"") === '')) {
                    return attrname + ' is required';
                } 

                return true;     
            },

            range : function(attrname, value, expectation) {
                if (!_.isNumber(value) || value < expectation[0] || value > expectation[1]) {
                    return attrname + ' must be between ' + expectation[0] +' and ' + expectation[1];
                }

                return true;
            },

            datetime : function(attrname, value) {
                if (!value.toString().match(/^[0-3]{0,1}[0-9]{1}[\/]{1}[0-1]{0,1}[0-9]{1}[\/]{1}[2]{1}[0-9]{1}[0-9]{1}[0-9]{1}[\s]{1}[0-1]{0,1}[0-9]{1}[:]{1}[0-5]{1}[0-9]{1}[:]{0,1}[0-5]{0,1}[0-9]{0,1}[\s]{1}[AapP]{1}[Mm]{1}$/)) {
                    return attrname + ' is invalid';
                }

                return true;
            }
        },

        initialize : function (){
            _.bindAll(this, 'validateAttr');
        },

        validate : function () {
            var attrValidations = _.pairs(this.validations),
                results = attrValidations.map(this.validateAttr),
                errors = results.filter(function (result){ return result.err;})

            if (errors.length > 0) return errors;
        },

        validateAttr : function(attrValidation) {
            var self = this,
                attrname = attrValidation[0],
                validations = _.pairs(attrValidation[1]),
                results = (validations.map(function (validation){
                    return self.validationExpressions[validation[0]](attrname, self.get(attrname), validation[1]);
                })).filter(function (result){ return _.isString(result);});

            return {
                msg : results,
                err : results.length > 0,
                attr: attrname
            };
        },

        urlRoot : function() {
            return Common.server + '/admin/api/post';
        }
    });

    return Post;
});