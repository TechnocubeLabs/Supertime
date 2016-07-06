/**
 * IndexController
 *
 * @description :: Server-side logic for managing indices
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    index: function(req, res) {
        if (!req.user) {
            sails.log.info("user is not logged in. redirecting to login page.");
            return res.redirect('/login');
        }
        Userdetails.findOne({
            login_id: req.user.id
        }).exec(function(err, userdetails) {
            if (err) {
                return res.send({ status: 0, message: err.message });
            }
            return res.view({
                user_role: userdetails.role
            });
        });
    }
};
