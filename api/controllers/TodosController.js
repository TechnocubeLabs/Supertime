/**
 * TodosController
 *
 * @description :: Server-side logic for managing todos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var async = require('async');
var moment = require('moment');

module.exports = {
    //create to do list.
    create: function(req, res) {
        async.waterfall([
            //check if projects/tasks exist. if not exists, create a new one.
            function(callback) {
                if (!req.param('project_id') || !req.user.id) {
                    callback("Project missing!", false);
                }
                if (!req.param('task_id')) {
                    callback("Task missing", false);
                }
                Projects.findOne({
                    id: req.param('project_id')
                }).exec(function(err, project) {
                    if (err) {
                        callback(err, false);
                    }
                    Tasks.findOne({
                        project: project.id,
                        id: req.param('task_id')
                    }).exec(function(err, tasks) {
                        if (err) {
                            callback(err, false);
                        }
                        tasks.task_type.add(req.param('task_type'));
                        tasks.save();
                        callback(null, tasks);
                    });
                });
            },
            //next, add user and attendance date, project and task  to the array todos.
            function(tasks, callback) {
                var todo_list = req.param('todo_list');
                async.forEach(todo_list, function(to_do, cb) {
                    to_do.user = req.user.id
                    to_do.project = tasks.project;
                    to_do.task_name = tasks.id;
                    to_do.task_type = req.param('task_type');
                    to_do.status = "To do";
                    to_do.priority = req.param('priority') || "Normal"
                    cb();
                }, function(err) {
                    callback(err, todo_list);
                });
            },
            //then, create the todo list in the database.
            function(todo_list, callback) {
                Todos.findOrCreate(todo_list).exec(function(err, todos) {
                    callback(err, todos);
                });
            }
        ], function(err, result) {
            if (err) {
                return res.send({ status: 0, messsage: err.messsage });
            }
            return res.send({ status: 1, message: "success!", todo_list: result });
        });
    },

    // return todays todo list of the user.
    find: function(req, res) {
        async.waterfall([
            //first, find out the user and the date.
            function(callback) {
                Attendance.findOne({
                    user: req.user.id,
                    attendance_date: moment(req.param('attendance_date')).format()
                }).populate('todos').exec(function(err, attendance) {
                    callback(err, attendance || {});
                });
            },
            //form an object of todos
            function(attendance, callback) {
                var todos = [];
                async.forEach(attendance.todos, function(current_item, cb) {
                    todos.push({ id: current_item.id });
                    cb();
                }, function(err) {
                    callback(null, todos);
                });
            },
            //next, find out all todos for that date.
            function(todos_array, callback) {
                Todos.find(todos_array)
                    .populate('project')
                    .populate('task_name')
                    .populate('task_type')
                    .exec(function(err, todos) {
                        async.forEach(todos, function(current_item, cb) {
                            current_item.estimatedDuration = current_item.getEstimatedDuration();
                            current_item.expected_delivery_date = current_item.task_name ? moment(current_item.task_name.expected_delivery_date).format("YYYY-MM-DD") : "-";
                            cb();
                        }, function(err) {
                            callback(err, todos);

                        });
                    });
            }
        ], function(err, todos) {
            if (err) {
                return res.send({ status: 0, message: err.message });
            }
            return res.send({ status: 1, message: "success", todos: todos });
        });
    },

    //update todo list.
    update: function(req, res) {
        if (!req.param('todo_id')) {
            return res.send({ status: 0, message: "No todo id." });
        }
        Todos.update({
                id: req.param('todo_id')
            }, req.param('available_updates'))
            .exec(function(err, todos) {
                if (err) {
                    return res.send({ status: 0, message: err.message });
                }
                return res.send({ status: 1, message: "success" });
            });
    },

    //get all todo list as per status request.
    getTodoLists: function(req, res) {
        async.waterfall([
            //find existing today's list
            function(callback) {
                Attendance.findOne({
                    user: req.user.id,
                    attendance_date: moment(req.param('attendance_date')).format()
                }).populate('todos').exec(function(err, attendance) {
                    callback(err, attendance ? attendance.todos : []);
                });
            },
            // prepare the ids to be excluded.
            function(todos, callback) {
                var exclude_ids = [];
                async.forEach(todos, function(item, cb) {
                    exclude_ids.push(item.id);
                    cb();
                }, function(err) {
                    callback(err, exclude_ids);
                });
            },
            function(exclude_ids, callback) {
                Todos.find({
                        user: req.user.id,
                        status: req.param('selectedStatuses')
                    }, {
                        sort: {
                            createdAt: 'desc'
                        }
                    })
                    .populate('project')
                    .populate('task_name')
                    .populate('task_type')
                    .exec(function(err, todos) {
                        if (err) {
                            return res.send({ status: 0, message: err.message });
                        }
                        async.forEach(todos, function(current_item, cb) {
                            current_item.estimatedDuration = current_item.getEstimatedDuration();
                            current_item.expected_delivery_date = current_item.task_name ? moment(current_item.task_name.expected_delivery_date).format("YYYY-MM-DD") : "-";
                            current_item.expected_delivery_date = current_item.expected_delivery_date == "Invalid date" ? '-' : current_item.expected_delivery_date;
                            if (exclude_ids.indexOf(current_item.id) == -1) {
                                current_item.isSelected = false;
                            } else {
                                current_item.isSelected = true;
                            }
                            cb();
                        }, function(err) {
                            return res.send({ status: 1, message: "success!", todos: todos || [] });
                        });
                    });
            }
        ], function(err, result) {});

    },

    //associate to do to required attendance date.
    setTodoDate: function(req, res) {
        Attendance.findOne({
            user: req.user.id,
            attendance_date: moment(req.param('attendance_date'), "YYYY-MM-DD").format()
        }).exec(function(err, attendance) {
            if (err) {
                return res.send({ status: 0, message: err.message });
            }
            attendance.todos.add(req.param('todo_id'));
            attendance.save(function(err) {
                if (err) {
                    return res.send({ status: 0, message: err.message });
                }
                return res.send({ status: 1, message: "success!", todos: attendance.todos });
            });
        });
    },

    //delete task(todo).
    delete: function(req, res) {
        if (!req.param('todo_id')) {    
            return res.send({ status: 0, message: "No Id specified." })
        }
        async.waterfall([
            //first remove any association with the task
            function(callback) {
                Todos.findOne({
                    id: req.param('todo_id')
                }).populate('todo_date').exec(function(err, todo) {
                    if (err) {
                        return res.send({ status: 0, message: err })
                    }
                    todo.todo_date.forEach(function(to_do) {
                        todo.todo_date.remove(to_do.id);
                        todo.save();
                    });
                    callback(null, todo.id);
                });
            },
            //next destroy the task
            function(todo_id, callback) {
                Todos.destroy({ id: todo_id }).exec(function(err) {
                    callback(err, todo_id);
                });
            }
        ], function(err, result) {
            if (err) {
                return res.send({ status: 0, message: "Server Error" });
            }
            return res.send({ status: 1, message: "success" });
        });
    }
};
