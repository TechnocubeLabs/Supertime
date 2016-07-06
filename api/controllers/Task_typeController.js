/**
 * Task_typeController
 *
 * @description :: Server-side logic for managing task_types
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    create: function(req, res) {
        Task_type.findOrCreate({
            name: req.param('task_type')
        }).exec(function(err, tasktype) {
            if (err) {
                return res.send({ status: 0, message: err.message });
            }
            return res.send({ status: 1, message: "success!", task_type: tasktype });
        });
    },

    find: function(req, res) {
        Task_type.find()
            .exec(function(err, task_types) {
                if (err) {
                    return res.send({ status: 0, message: err.message });
                }
                return res.send({ status: 1, message: "success", task_types: task_types });
            });
    }
};
