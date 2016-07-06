technocubeAttendance.controller('reportTodosCtrl', ['$scope', '$http', '$mdDialog', function($scope, $http, $mdDialog) {
    $scope.priorities = {};

    $scope.changePriority = function(todo_id) {
        $http.post('/todos/update', {
            available_updates: { priority: $scope.priorities[todo_id] },
            todo_id: todo_id
        }).then(function(res) {
            $mdDialog.show({
                template: '<div layout="row" layout-align="center">success!</div>'
            });
            setTimeout(function() { $mdDialog.hide(); }, 300);
        }, function(err) {
            alert("You session had expired or something went wrong. Please login and try again.");
            window.location.href = "/";
        });
    };

    $http.get('/report/todos').then(function(res) {
        $scope.alltodosreport = res.data.todos;
        $scope.tasks = [];
        $scope.userlists = [];
        var userlists = [];
        angular.forEach($scope.alltodosreport || [], function(todo) {
            $scope.priorities[todo.id] = todo.priority;
            if ($scope.tasks.indexOf(todo.task_name ? todo.task_name.task_name : {}) == -1) {
                $scope.tasks.push(todo.task_name ? todo.task_name.task_name : {});
            }
            if (userlists.indexOf(todo.user.getName) == -1) {
                userlists.push(todo.user.getName);
            }
        });
        $scope.userlists = userlists;
    }, function(err) {
        alert("You session had expired or something went wrong. Please login and try again.");
        window.location.href = "/";
    });

    $http.get('/projects/find').then(function(res) {
        $scope.projects = res.data.projects;
    }, function(err) {
        alert("You session had expired or something went wrong. Please login and try again.");
        window.location.href = "/";
    });

    $scope.clearFilter = function(criterianame, criteriafield) {
        if (criterianame && criteriafield) {
            $scope.status[criterianame][criteriafield] = "";
        } else if (criterianame) {
            $scope.status[criterianame] = "";
        } else {
            $scope.status = {};
        }
    };
}]);
