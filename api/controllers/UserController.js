/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    find: function(req, res) {
        User.find()
            .exec(function(err, users) {
                if (err) {
                    res.send({ status: 0, message: err.message });
                }
                res.send({ status: 1, message: "success", users: users });
            });
    }
};
