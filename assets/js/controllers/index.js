/*
 *
 *      index.js file for index page controller
 *
 */

technocubeAttendance.controller('indexCtrl', ['$scope', '$http', '$mdDialog', function($scope, $http, $mdDialog) {
    $scope.todos = [];
    $scope.project = $scope.project || {};
    $scope.task = $scope.task || {};
    $scope.statuses = {};
    $scope.hours = {};
    $scope.minutes = {};
    $scope.priorities = {};

    $scope.addList = function() {
        $scope.todos_list = [];

        if (!$scope.description || !$scope.task || !$scope.project) {
            alert("description, task and project are mandatory fields.");
            return false;
        }

        if ($scope.description) {
            $scope.todos_list.push({
                description: $scope.description,
                estimated_hour: $scope.hour || "00",
                estimated_minute: $scope.minute || "00"
            });
            console.log("asglsg", $scope.task.task_type, $scope.task_type)
            $http.post('/todos/create', {
                attendance_date: moment().format("YYYY-MM-DD"),
                todo_list: $scope.todos_list,
                project_id: $scope.project.id,
                task_id: $scope.task.id,
                task_type: $scope.tasktype.id
            }).then(function(res) {
                $mdDialog.show({
                    template: '<div layout="row" layout-align="center">success!</div>'
                });
                setTimeout(function() { $mdDialog.hide(); }, 300);
                $scope.findTodos();
                $scope.getTodoLists();
                $scope.description = $scope.hour = $scope.minute = "";
            }, function(err) {
                alert("You session had expired or something went wrong. Please login and try again.");
                window.location.href = "/";

                //do nothing.
            });
        }
    };

    $scope.findTodos = function() {
        $http.get('/todos/find', {
            params: { attendance_date: moment().format("YYYY-MM-DD") }
        }).then(function(res) {
            $scope.todos = res.data.todos || [];
            $scope.todos.forEach(function(todo) {
                $scope.statuses[todo.id] = todo.status;
                $scope.priorities[todo.id] = todo.priority || "Normal";
                $scope.hours[todo.id] = todo.actual_hour;
                $scope.minutes[todo.id] = todo.actual_minute;
            });
        }, function(err) {
            alert("You session had expired or something went wrong. Please login and try again.");
            window.location.href = "/";

            //do nothing.
        });
    };
    $scope.findTodos();

    $scope.findProject = function() {
        $http.get('/projects/find')
            .then(function(res) {
                $scope.projects = res.data.projects;
            }, function(err) {
                alert("You session had expired or something went wrong. Please login and try again.");
                window.location.href = "/";
            });
    };
    $scope.findProject();

    /*$scope.findTasks = function() {
        $http.get('/tasks/find')
            .then(function(res) {
                $scope.tasks = res.data.tasks;
            }, function(err) {
    alert("You session had expired or something went wrong. Please login and try again.");
                window.location.href = "/";
            });
    };
    $scope.findTasks();*/

    $scope.updateTodo = function(index) {
        var available_updates = {};
        if ($scope.hours[index] || $scope.minutes[index]) {
            available_updates.actual_hour = $scope.hours[index] || 0;
            available_updates.actual_minute = $scope.minutes[index] || 0;
        }
        available_updates.status = $scope.statuses[index];
        available_updates.priority = $scope.priorities[index];

        $http.post('/todos/update', { todo_id: index, available_updates: available_updates }).then(function(res) {
            $scope.findTodos();
        }, function(err) {
            alert("You session had expired or something went wrong. Please login and try again.");
            window.location.href = "/";
        });
    };

    $scope.editTask = function(temp) {
        $mdDialog.show({
            templateUrl: 'templates/editTask.html',
            controller: 'editTaskCtrl',
            locals: { task: temp },
            clickOutsideToClose: true
        }).then(function(status) {
            if (status) {
                $scope.getTodoLists();
                $scope.findTodos();
            }
        });
    };

    $scope.setTaskProperty = function() {
        $scope.task_name = $scope.task.task_name;
        $scope.task_type = $scope.task.task_type || 'development';
    };

    $scope.setProjectProperty = function() {
        $scope.tasks = $scope.project.tasks;
    };

    $scope.getTodoLists = function() {
        if (!$scope.selectedStatuses) {
            $scope.selectedStatuses = ['To do', 'WIP'];
        } else if ($scope.selectedStatuses) {
            console.log($scope.selectedStatuses);
        }
        $http.get('/todos/getTodoLists', {
            params: {
                selectedStatuses: $scope.selectedStatuses || ['To do', 'WIP'],
                attendance_date: moment().format("YYYY-MM-DD")
            }
        }).then(function(res) {
            console.log(res);
            $scope.todoLists = res.data.todos || [];
        }, function(err) {
            alert("You session had expired or something went wrong. Please login and try again.");
            window.location.href = "/";
        });
    };
    $scope.getTodoLists();

    $scope.selectTodo = function(todo_id) {
        todo_id.isSelected = true;
        $http.post('/todos/setTodoDate', {
            attendance_date: moment().format("YYYY-MM-DD"),
            todo_id: todo_id.id
        }).then(function(res) {
            console.log(res.data);
            $scope.findTodos();
        }, function(err) {
            alert("You session had expired or something went wrong. Please login and try again.");
            window.location.href = "/";
        });
    };

    $scope.clearSelection = function() {
        $scope.project = $scope.task = $scope.project_name = $scope.task_name = $scope.tasktype = null;
    };

    $scope.addProject = function() {
        if (!$scope.project_name) {
            alert("Please provide project name");
            return false;
        }
        $http.post('/projects/create', {
            project_name: $scope.project_name
        }).then(function(res) {
            window.location.reload(true);
        }, function(err) {
            alert("You session had expired or something went wrong. Please login and try again.");
            window.location.href = "/";
        });
    };

    $scope.addTask = function() {
        if (!$scope.project || !$scope.task_name || !$scope.expected_deliver_date) {
            alert("Please provide project, task and expected delivery date.");
            return false;
        }
        console.log(moment($scope.expected_deliver_date).format("YYYY-MM-DD"));
        $http.post('/tasks/create', {
            project_id: $scope.project.id,
            task_name: $scope.task_name,
            expected_deliver_date: moment($scope.expected_deliver_date).format("YYYY-MM-DD")
        }).then(function(res) {
            console.log(res);
            window.location.reload(true);
        }, function(err) {
            alert("You session had expired or something went wrong. Please login and try again.");
            window.location.href = "/";
        });
    };

    $scope.fetchTaskType = function() {
        $http.get('/task_type/find').then(function(res) {
            $scope.task_types = res.data.task_types;
        }, function(err) {
            alert("You session had expired or something went wrong. Please login and try again.");
            window.location.href = "/";
        });
    };
    $scope.fetchTaskType();

    $scope.addTaskType = function() {
        if (!$scope.task_type_name) {
            alert("Please enter the name of task type.");
        } else {
            $http.post('/task_type/create', {
                task_type: $scope.task_type_name
            }).then(function(res) {
                window.location.reload(true);
            }, function(err) {
                alert("You session had expired or something went wrong. Please login and try again.");
                window.location.href = "/";
            });
        }
    }
}]);
