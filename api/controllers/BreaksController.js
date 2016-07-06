/**
 * BreaksController
 *
 * @description :: Server-side logic for managing breaks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var moment = require('moment');
var async = require('async');

module.exports = {
    index: function(req, res) {
        res.view()
    },

    startBreak: function(req, res) {
        async.waterfall([
            function(callback) { // first find the attendance id of user.
                Attendance.findOne({
                    userdetails: req.user.id,
                    attendance_date: moment(req.param('attendance_date'), "YYYY-MM-DD").format()
                }).exec(function(err, attendance) {
                    callback(err, attendance);
                });
            },
            function(attendance, callback) { // record the break for the given attendance date and user.
                Breaks.create({
                    user: attendance.userdetails,
                    start_time: req.param('start_time'),
                    reason: req.param('reason'),
                    comment: req.param('comment'),
                    attendance_date: attendance.id
                }).exec(function(err, breaks) {
                    callback(err, breaks);
                })
            }
        ], function(err, record) {
            if (err) {
                return res.send({ status: 0, message: err.message });
            }
            //return res.send({ status: 1, message: "success!", breaks: record });
            return res.redirect('/breaks')
        });
    },

    endBreak: function(req, res) {
        Breaks.update({
            id: req.param('break_id')
        }, {
            end_time: req.param('end_time')
        }).exec(function(err, breaks) {
            if (err) {
                return res.send({ status: 0, message: err.message });
            }
            return res.send({ status: 1, message: "success!", breaks: breaks[0] });
        });
    },

    getbreaks: function(req, res) {
        async.waterfall([
            function(callback) { // first find the attendance id of user.
                Attendance.findOne({
                    userdetails: req.user.id,
                    attendance_date: moment(req.param('attendance_date'), "YYYY-MM-DD").format()
                }).exec(function(err, attendance) {
                    callback(err, attendance);
                });
            },
            function(attendance, callback) { // record the break for the given attendance date and user.
                Breaks.find({
                    user: attendance.userdetails,
                    attendance_date: attendance.id
                }, {
                    sort: {
                        updatedAt: 'desc'
                    }
                }).exec(function(err, breaks) {
                    async.forEach(breaks, function(break_item, cb) {
                        break_item.start_time = moment(break_item.start_time).format("HH:mm:ss");
                        if (break_item.end_time) {
                            break_item.end_time = moment(break_item.end_time).format("HH:mm:ss");
                        }
                        cb();
                    }, function(err) {
                        callback(err, breaks);
                    });
                })
            }
        ], function(err, record) {
            if (err) {
                return res.send({ status: 0, message: err.message });
            }
            return res.send({ status: 1, message: "success!", breaks: record });
        });
    }
};
