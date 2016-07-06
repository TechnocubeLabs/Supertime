/**
 * AttendanceController
 *
 * @description :: Server-side logic for managing attendances
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var moment = require('moment');

module.exports = {

    create: function(req, res) {
        var body = req.body;
        var attendance_details = {
            user: body.user,
            attendance_date: moment(body.attendance_date).format(),
            login_time: body.login_time,
            userdetails: body.user
        };
        Attendance.findOne({ user: attendance_details.user, attendance_date: attendance_details.attendance_date })
            .exec(function(err, attendance_record) {
                if (err) {
                    return res.send({ status: 0, message: err.message });
                }
                if (attendance_record) {
                    /*todoService.pickTodo(attendance_record.user, attendance_record.id, function(err) {
                        if (err) {
                            return res.redirect('/login');
                        } else {
                            return res.redirect('/index');
                        }
                    });*/
                    return res.redirect('/index');
                    //return res.send({ status: 1, message: "Already log in for today @" + attendance_record.login_time });
                }
                Attendance.create(attendance_details).exec(function(err, attendance_today) {
                    if (err) {
                        return res.send({ status: 0, message: err.message });
                    }
                    if (!attendance_today) {
                        return res.send({ status: 0, message: "Internal Server Error!" });
                    }
                    //return res.send({ status: 1, message: "success", attendace: attendance_today });
                    todoService.pickTodo(attendance_today.user, attendance_today.id, function(err) {
                        if (err) {
                            return res.redirect('/login');
                        } else {
                            return res.redirect('/index');
                        }
                    });
                });
            });
    },

    updatelogoutTime: function(req, res) {
        Attendance.update({
            user: req.user.id,
            attendance_date: moment(req.body.attendance_date).format()
        }, {
            logout_time: req.param('logout_time')
        }).exec(function(err, attendance_records) {
            if (err) {
                return res.send({ status: 0, message: err.message });
            }
            req.logout();
            res.redirect('/login');
        });
    }
};
