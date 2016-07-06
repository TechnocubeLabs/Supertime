/**
 * ReportController
 *
 * @description :: Server-side logic for managing reports
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var async = require('async');
var moment = require('moment');

module.exports = {
    index: function(req, res) {
        res.view({
            page: req.param('page') || 'livereport'
        })
    },

    attendance: function(req, res) {
        async.waterfall([
            //first check the user access level
            function(callback) {
                Userdetails.findOne({
                    id: req.user.id
                }, {
                    select: ["role"]
                }).exec(function(err, role) {
                    callback(err, role);
                });
            },
            function(role, callback) {
                if (!role) {
                    callback("No role", null);
                }

                role = role.role;
                var from_date = req.param('from_date') || moment(moment().subtract(10, 'days')).format();
                var to_date = req.param('to_date') || moment().format();

                switch (role) {
                    //level 1
                    case 1:
                        Attendance.find({
                                user: req.user.id,
                                attendance_date: {
                                    "<=": to_date,
                                    ">=": from_date
                                }
                            }, {
                                sort: {
                                    attendance_date: "desc"
                                }
                            })
                            .populate('user')
                            .populate('breaks')
                            .exec(function(err, attendance) {
                                callback(err, attendance);
                            });
                        break;
                        //level 2
                    case 2:
                        Attendance.find({
                                attendance_date: {
                                    "<=": to_date,
                                    ">=": from_date
                                }
                            }, {
                                sort: {
                                    attendance_date: "desc"
                                }
                            })
                            .populate('user')
                            .populate('breaks')
                            .exec(function(err, attendance) {
                                callback(err, attendance);
                            });
                        break;
                }
            },
            function(attendance, callback) {
                async.forEach(attendance || [], function(item, cb) {
                    item.total_login_duration = item.getLoginDuration();
                    item.attendance_date = moment(item.attendance_date).format("YYYY-MM-DD");
                    item.login_time = moment(item.login_time).format("HH:mm:ss");
                    item.logout_time = moment(item.logout_time).isValid() ? moment(item.logout_time).format("HH:mm:ss") : "-";
                    item.break_duration = 0;
                    for (var i = 0; i < item.breaks.length; i++) {
                        item.breaks[i].duration = item.breaks[i].getBreakMinutes();
                        item.break_duration += parseInt(item.breaks[i].duration);
                    }
                    item.break_duration = moment(Math.floor(item.break_duration / 60) + ':' + item.break_duration % 60 + ':00', "HH:mm:ss").format("HH:mm:ss");
                    item.effective_login_duration = moment(item.total_login_duration, "HH:mm:ss").diff(moment(item.break_duration, "HH:mm:ss"), 'minutes');
                    item.effective_login_duration = moment(Math.floor(item.effective_login_duration / 60) + ':' + item.effective_login_duration % 60 + ':00', "HH:mm:ss").format("HH:mm:ss");
                    cb();
                }, function(err) {
                    callback(err, attendance);
                });
            }
        ], function(err, report) {
            if (err) {
                return res.send({ status: 0, message: err });
            }
            return res.send({ status: 1, message: "success", attendance: report });
        });
    },

    live: function(req, res) {
        async.waterfall([
            //first check the user access level
            function(callback) {
                Userdetails.findOne({
                    id: req.user.id
                }, {
                    select: ["role"]
                }).exec(function(err, role) {
                    callback(err, role);
                });
            },
            function(role, callback) {
                if (!role) {
                    callback("No role", null);
                }

                role = role.role;
                var attendance_date = moment(req.param('attendance_date')).format() || moment(moment().format("YYYY-MM-DD")).format();
                switch (role) {
                    //level 1
                    case 1:
                        Attendance.find({
                                user: req.user.id
                            }, {
                                sort: {
                                    attendance_date: 'desc'
                                },
                                limit: 1
                            })
                            .populate('todos')
                            .populate('user')
                            .exec(function(err, attendance) {
                                callback(err, attendance);
                            });
                        break;
                        //level 2
                    case 2:
                        Attendance.find({
                                attendance_date: moment(req.param('attendance_date'), "YYYY-MM-DD").format()
                            })
                            .populate('todos')
                            .populate('user')
                            .exec(function(err, attendance) {
                                callback(err, attendance);
                            });
                        break;
                }
            },
            function(attendance, callback) {
                var todos = [];
                var attendance_date = moment(attendance.attendance_date).format("YYYY-MM-DD");

                async.forEach(attendance, function(item, cb) {
                    todos = todos.concat(item.todos);
                    cb();
                }, function(err) {
                    callback(err, attendance_date, todos);
                });
            },
            function(attendance_date, todos, callback) {
                var todo_ids = [];

                async.forEach(todos, function(item, cb) {
                    if (item.id) {
                        todo_ids.push({ id: item.id });
                    }
                    cb();
                }, function(err) {
                    callback(null, todo_ids, attendance_date);
                })
            },
            function(todo_ids, attendance_date, callback) {
                Todos.find(todo_ids)
                    .populate('project')
                    .populate('task_name')
                    .populate('user')
                    .exec(function(err, todos) {
                        callback(err, todos, attendance_date);
                    });
            },
            function(todos, attendance_date, callback) {
                async.forEach(todos, function(item, cb) {
                    item.attendance_date = attendance_date;
                    item.user.getName = item.user.getName();
                    item.estimated_time = item.getEstimatedDuration();
                    item.actual_time = item.getActualDuration();
                    cb();
                }, function(err) {
                    callback(err, todos);
                });
            }
        ], function(err, report) {
            if (err) {
                return res.send({ status: 0, message: err });
            }
            return res.send({ status: 1, message: "success", todos: report });
        });
    },

    todos: function(req, res) {
        async.waterfall([
            //first check the user access level
            function(callback) {
                Userdetails.findOne({
                    id: req.user.id
                }, {
                    select: ["role"]
                }).exec(function(err, role) {
                    callback(err, role);
                });
            },
            function(role, callback) {
                if (!role) {
                    callback("No role", null);
                }

                role = role.role;

                switch (role) {
                    //level 1
                    case 1:
                        Todos.find({
                                user: req.user.id
                            }, {
                                sort: {
                                    createdAt: "desc"
                                }
                            })
                            .populate('user')
                            .populate('project')
                            .populate('task_name')
                            .exec(function(err, todos) {
                                callback(err, todos);
                            });
                        break;
                        //level 2
                    case 2:
                        Todos.find({
                                sort: {
                                    createdAt: "desc"
                                }
                            })
                            .populate('user')
                            .populate('project')
                            .populate('task_name')
                            .exec(function(err, todos) {
                                callback(err, todos);
                            });
                        break;
                }
            },
            function(todos, callback) {
                async.forEach(todos, function(item, cb) {
                    item.user.getName = item.user.getName();
                    item.estimated_time = item.getEstimatedDuration();
                    item.actual_time = item.getActualDuration();
                    cb();
                }, function(err) {
                    callback(err, todos);
                });
            }
        ], function(err, report) {
            if (err) {
                return res.send({ status: 0, message: err });
            }
            return res.send({ status: 1, message: "success", todos: report });
        });
    },

    work_log: function(req, res) {
        async.waterfall([
                //first check the user access level
                function(callback) {
                    Userdetails.findOne({
                        id: req.user.id
                    }, {
                        select: ["role"]
                    }).exec(function(err, role) {
                        callback(err, role);
                    });
                },
                function(role, callback) {
                    if (!role) {
                        callback("No role", null);
                    }

                    role = role.role;
                    var attendance_date = moment(req.param('attendance_date')).format() || moment(moment().format("YYYY-MM-DD")).format();
                    switch (role) {
                        //level 1
                        case 1:
                            Attendance.find({
                                    user: req.user.id
                                }, {
                                    sort: {
                                        attendance_date: 'desc'
                                    },
                                    limit: 10
                                })
                                .populate('todos')
                                .populate('user')
                                .exec(function(err, attendance) {
                                    callback(err, attendance);
                                });
                            break;
                            //level 2
                        case 2:
                            Attendance.find({
                                    attendance_date: {
                                        ">=": moment(req.param('from_date')).format(),
                                        "<=": moment(req.param('to_date')).format()
                                    }
                                })
                                .populate('todos')
                                .populate('user')
                                .exec(function(err, attendance) {
                                    callback(err, attendance);
                                });
                            break;
                    }
                },
                function(attendance, callback) {
                    var todos = [];
                    async.forEach(attendance, function(item, cb) {
                        todos = todos.concat(item.todos);
                        cb();
                    }, function(err) {
                        callback(err, todos);
                    });
                },
                function(todos, callback) {
                    var todo_ids = [];
                    async.forEach(todos, function(item, cb) {
                        if (item.id) {
                            todo_ids.push({ id: item.id });
                        }
                        cb();
                    }, function(err) {
                        callback(null, todo_ids);
                    })
                },
                function(todos_ids, callback) {
                    Todos.find(todos_ids)
                        .populate('project')
                        .populate('task_name')
                        .populate('user')
                        .populate('todo_date', {sort:{ 'id': 'desc'}})
                        .populate('task_type')
                        .exec(function(err, todos) {
                            callback(err, todos);
                        });
                },
                function(todos, callback) {
                    var report = [];
                    var from_date = req.param('from_date');
                    var to_date = req.param('to_date');

                    async.forEach(todos, function(item, cb) {
                        item.user.getName = item.user.getName();
                        item.estimated_time = item.getEstimatedDuration();
                        item.actual_time = item.getActualDuration();
                        item.attendance_date = moment(item.todo_date[0].attendance_date).format("YYYY-MM-DD");
                        item.lastest_status_date = moment(item.todo_date[item.todo_date.length-1].attendance_date).format("YYYY-MM-DD");
                        /*async.forEach(item.todo_date, function(subject_date, cb2) {
                            if (moment(subject_date.attendance_date).isSameOrAfter(from_date) && moment(subject_date.attendance_date).isSameOrBefore(to_date)) {
                                report.push({
                                    attendance_date: moment(subject_date.attendance_date).format("YYYY-MM-DD"),
                                    user: item.user,
                                    project: item.project,
                                    task_name: item.task_name,
                                    estimated_time: item.estimated_time,
                                    actual_time: item.actual_time,
                                    status: item.status,
                                    description: item.description
                                });
                            }
                            cb2();
                        }, function(err) {
                            cb();
                        });*/
                        cb();
                    }, function(err) {
                        callback(err, todos/*report*/);
                    });
                }
            ],
            function(err, report) {
                if (err) {
                    return res.send({ status: 0, message: err });
                }
                return res.send({ status: 1, message: "success", todos: report });
            });
    },

    breaks: function(req, res) {
        async.waterfall([
            //first check the user access level
            function(callback) {
                Userdetails.findOne({
                    id: req.user.id
                }, {
                    select: ["role"]
                }).exec(function(err, role) {
                    callback(err, role);
                });
            },
            function(role, callback) {
                if (!role) {
                    callback("No role", null);
                }
                role = role.role;
                var from_date = req.param('from_date') || moment(moment().subtract(10, 'days')).format();
                var to_date = req.param('to_date') || moment().format();

                switch (role) {
                    //level 1
                    case 1:
                        Attendance.find({
                                user: req.user.id,
                                attendance_date: {
                                    "<=": to_date,
                                    ">=": from_date
                                }
                            }, {
                                sort: {
                                    attendance_date: "desc"
                                }
                            })
                            .populate('user')
                            .populate('breaks')
                            .exec(function(err, attendance) {
                                callback(err, attendance);
                            });
                        break;
                        //level 2
                    case 2:
                        Attendance.find({
                                attendance_date: {
                                    "<=": to_date,
                                    ">=": from_date
                                }
                            }, {
                                sort: {
                                    attendance_date: "desc"
                                }
                            })
                            .populate('user')
                            .populate('breaks')
                            .exec(function(err, attendance) {
                                callback(err, attendance);
                            });
                        break;
                }
            },
            function(attendance, callback) {
                var breaks = [];
                async.forEach(attendance || [], function(item, cb) {
                    async.forEach(item.breaks, function(break_item, cb2) {
                        break_item.duration = break_item.getBreakDuration();
                        break_item.user = item.user.username;
                        break_item.attendance_date = moment(item.attendance_date).format("YYYY-MM-DD");
                        break_item.start_time = moment(break_item.start_time).format("HH:mm:ss");
                        break_item.end_time = moment(break_item.end_time).format("HH:mm:ss");
                        breaks.push(break_item);
                        cb2();
                    }, function(err) {
                        cb();
                    })
                }, function(err) {
                    callback(err, breaks);
                });
            }
        ], function(err, report) {
            if (err) {
                return res.send({ status: 0, message: err });
            }
            return res.send({ status: 1, message: "success", breaks: report });
        });
    }
};
