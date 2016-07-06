/**
 * TasksController
 *
 * @description :: Server-side logic for managing tasks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var async = require('async');
var moment= require('moment');

module.exports = {
    create: function(req, res) {
        if (!req.param('task_name')) {
            return res.send({ status: 0, message: "Please provide task name" });
        }
        Tasks.findOrCreate({
            project: req.param('project_id'),
            task_name: req.param('task_name'),
            expected_delivery_date: moment(req.param('expected_deliver_date'), "YYYY-MM-DD").format()
        }).exec(function(err, task) {
            if (err) {
                return res.send({ status: 0, message: err.message });
            }
            return res.send({ status: 1, message: "success!", task: task });
        });
    },

    find: function(req, res) {
        var query = {};
        if (req.param('project_id')) {
            query.project = req.param('project_id');
        }
        Tasks.find(query, {
                sort: {
                    createdAt: "desc"
                }
            })
            .populate('task_type')
            .exec(function(err, tasks) {
                if (err) {
                    return res.send({ status: 0, message: err.message });
                }
                return res.send({ status: 1, message: "success!", tasks: tasks });
            });
    },

    update: function(req, res) {
        Tasks.update({
            id: req.param('task_id')
        }, {
            task_name: req.param('task_name')
        }).exec(function(err, tasks) {
            if (err) {
                return res.send({ status: 0, message: err.message });
            }
            return res.send({ status: 1, message: "success!", task: tasks[0] });
        });
    }
};
