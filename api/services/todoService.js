var async = require('async');
var moment = require('moment');


exports.pickTodo = function(user_id, attendance, next) {
    async.waterfall([
        //first find out Todos that are pending.
        function(callback) {
            Todos.find({
                    status: ['To do', 'WIP'],
                    user: user_id
                })
                .populate('todo_date')
                .exec(function(err, todos) {
                    if (err) {
                        sails.log.info(err);
                    }
                    callback(err, todos);
                });
        },
        //check if todo has a date
        function(todos, callback) {
            async.forEach(todos, function(todo, cb) {
                if (todo.todo_date.length) {
                	todo.todo_date.add(attendance);
                	todo.save();
                }
                cb();
            }, function(err) {
            	callback(err, null)
            });
        }
    ], function(err, result) {
    	next(err);
    });
}
