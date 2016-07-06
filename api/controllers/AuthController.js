/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var passport = require('passport');
var AttendanceController = require('../controllers/AttendanceController');

module.exports = {

    login: function(req, res) {
        passport.authenticate('local', function(err, user, message) {
            req.logIn({ id: user.id }, function(err) {
                if (err) {
                    //res.view('500');
                    return res.redirect('/login');
                }
                //return res.send({ status: 1, message: "success!", user: user });
                req.body.user = user.id;
                AttendanceController.create(req, res);
            });
        })(req, res);
    },

    logout: function(req, res) {
        /*req.logout();
        res.redirect('/login');*/
        AttendanceController.updatelogoutTime(req, res);
    }
};
