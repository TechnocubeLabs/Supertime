/**
 * RegisterController
 *
 * @description :: Server-side logic for managing registers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var async = require('async');
var crypto = require('crypto');

module.exports = {
    index: function(req, res) {
        return res.view({});
    },

    signup: function(req, res) {
        async.waterfall([
            function(callback) { //First create the user.
                User.findOrCreate({
                        username: req.param('username'),
                        email: req.param('email')
                    })
                    .exec(function(err, user) {
                        callback(err, user);
                    });
            },
            function(user, callback) { //create passport for the newly created user. 
                var access_token = crypto.randomBytes(48).toString('base64');
                Passport.create({
                    identifier: user.id,
                    provider: 'local',
                    provider_token: '',
                    provider_secret: '',
                    access_token: access_token,
                    user: user.id,
                    password: req.param('password')
                }).exec(function(err, passport) {
                    callback(err, user);
                });
            },
            function(user, callback) { //create a details entry for the user.
                Userdetails.findOrCreate({
                        login_id: user.id
                    })
                    .exec(function(err, userdetails) {
                        callback(err, user);
                    });
            }
        ], function(err, user) { //Finally return the user.
            if (err) {
                return res.send({ status: 0, message: err.message });
            }
            //return res.send({ status: 1, message: "success", user: user });
            return res.redirect('/');
        });
    }
};
