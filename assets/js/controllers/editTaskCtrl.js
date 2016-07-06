technocubeAttendance.controller('editTaskCtrl', ['$scope', '$http', '$mdDialog', 'task', function($scope, $http, $mdDialog, task) {
    $scope.findProject = function() {
        $http.get('/projects/find')
            .then(function(res) {
                $scope.projects = res.data.projects;
                $scope.project = $scope.projects[$scope.projects.map(function(e) {
                    return e.id
                }).indexOf(task.project.id)];
                $scope.tasks = $scope.project.tasks;
                $scope.task = $scope.tasks[$scope.tasks.map(function(e) {
                    return e.id
                }).indexOf(task.task_name.id)];
            }, function(err) {
                alert("You session had expired or something went wrong. Please login and try again.");
                window.location.href = "/";
            });
    };
    $scope.findProject();

    $scope.setProjectProperty = function() {
        $scope.tasks = $scope.project.tasks;
    };

    $scope.fetchTaskType = function() {
        $http.get('/task_type/find').then(function(res) {
            $scope.task_types = res.data.task_types;
            $scope.tasktype = $scope.task_types[$scope.task_types.map(function(e) {
                return e.id
            }).indexOf(task.task_type.id)];

        }, function(err) {
            alert("You session had expired or something went wrong. Please login and try again.");
            window.location.href = "/";
        });
    };
    $scope.fetchTaskType();

    $scope.description = task.description;
    $scope.hour = task.estimated_hour;
    $scope.minute = task.esitmated_minute;
    $scope.status = task.status;
    $scope.priority = task.priority;

    $scope.deleteTask = function() {
        $http.post('/todos/delete', {
            todo_id: task.id
        }).then(function(res) {
            $mdDialog.hide(1);
        }, function(err) {
            alert("You session had expired or something went wrong. Please login and try again.");
            window.location.href = "/";
        });
    };
    console.log("task id is", task.id);

    $scope.updateTask = function() {
        var available_updates = {};
        if ($scope.hour || $scope.minute) {
            available_updates.estimated_hour = $scope.hour || 0;
            available_updates.estimated_minute = $scope.minute || 0;
        }
        available_updates.status = $scope.status;
        available_updates.priority = $scope.priority;
        available_updates.project = $scope.project.id;
        available_updates.task_name = $scope.task.id;
        available_updates.task_type = $scope.tasktype.id;

        $http.post('/todos/update', { todo_id: task.id, available_updates: available_updates }).then(function(res) {
            $mdDialog.hide(1);
        }, function(err) {
            alert("You session had expired or something went wrong. Please login and try again.");
            window.location.href = "/";
        });
    };

    $scope.cancelDialog = function() {
        $mdDialog.hide(0);
    }

}]);
