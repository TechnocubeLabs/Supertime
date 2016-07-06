/**
 * ProjectsController
 *
 * @description :: Server-side logic for managing projects
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var async = require('async');

module.exports = {
    create: function(req, res) {
        if (!req.param('project_name')) {
            return res.send({ status: 0, message: "Please provide Project Name" });
        }
        Projects.findOrCreate({
            project_name: req.param('project_name')
        }).exec(function(err, project) {
            if (err) {
                return res.send({ status: 0, message: err.message });
            }
            return res.send({ status: 1, message: "success!", project: project });
        });
    },

    find: function(req, res) {
        Projects.find({
            sort: {
                createdAt: "desc"
            }
        }).populate('tasks').exec(function(err, projects) {
            if (err) {
                return res.send({ status: 0, message: err.message });
            }
            return res.send({ status: 1, message: "success!", projects: projects });
        });
    },

    update: function(req, res) {
        Projects.update({
            id: req.param('project_id')
        }, {
            project_name: req.param('project_name')
        }).exec(function(err, projects) {
            if (err) {
                return res.send({ status: 0, message: err.message });
            }
            return res.send({ status: 1, message: "success!", project: projects[0] });
        });
    }
};
