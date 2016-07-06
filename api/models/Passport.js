/**
 * Passport.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var bcrypt = require('bcrypt');

module.exports = {

    attributes: {
        provider: { //the protocol to be used for the passport
            type: 'alphanumeric',
            required: true
        },
        identifier: {
            type: 'string',
            required: true
        },
        password: { //the password field
            type: 'string',
        },
        user: {
            model: 'user'
        },
        provider_token: {
            type: 'string'
        },
        provider_secret: {
            type: 'string'
        },
        access_token: {
            type: 'string'
        },
        validatePassword: function(password, callback) {
            bcrypt.compare(password, this.password, callback);
        }
    },

    beforeCreate: function(user, callback) { //hash the password using bcrypt
        if (user.password) {
            bcrypt.hash(user.password, 8, function(err, hash) {
                user.password = hash;
                callback(err, user)
            });
        } else {
            callback(null, user);
        }
    }
};
