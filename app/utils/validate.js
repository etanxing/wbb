var _ = require('underscore'),
    expressions = {
        required: function(attrname, value) {
            if (_.isNull(value) || _.isUndefined(value) || (_.isString(value) && value.replace(/^\s+|\s+$/g, "") === '')) {
                return attrname + ' is required';
            }
        },

        range: function(attrname, value, expectation) {
            if (!_.isNumber(value) || value < expectation[0] || value > expectation[1]) {
                return attrname + ' must be between ' + expectation[0] + ' and ' + expectation[1];
            }
        },

        datetime: function(attrname, value) {
            if (!value.toString().match(/^[0-3]{0,1}[0-9]{1}[\/]{1}[0-1]{0,1}[0-9]{1}[\/]{1}[2]{1}[0-9]{1}[0-9]{1}[0-9]{1}[\s]{1}[0-1]{0,1}[0-9]{1}[:]{1}[0-5]{1}[0-9]{1}[:]{0,1}[0-5]{0,1}[0-9]{0,1}[\s]{1}[AapP]{1}[Mm]{1}$/)) {
                return attrname + ' is invalid';
            }
        }
    },

    models = {
        'post': {
            title: {
                required: true
            },

            slug: {
                required: true
            },

            content: {
                required: true
            },

            status: {
                range: [1, 3]
            },

            type: {
                range: [1, 2]
            },

            date: {
                required: true,
                datetime: true
            }
        }
    },

    validate = function(options) {
        var self = this,
            result = [],
            model = models[_.isString(options) ? options : options.target];

        if (model) {
            for (var attrname in model) {
                for (var expression in model[attrname]) {
                    var rs = expressions[expression](attrname, self[attrname], model[attrname][expression]);
                    if (rs !== undefined) result.push({
                        attr: attrname,
                        msg: rs
                    });
                }
            }

            return result;
        }
    };

if (typeof exports !== 'undefined') {
    exports.validate = validate
} else {
    return {
        validate: validate
    }
}