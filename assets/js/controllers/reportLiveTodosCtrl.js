/*reportLiveTodosCtrl Controller*/

technocubeAttendance.controller('reportLiveTodosCtrl', ['$scope', '$http', function($scope, $http) {
    $http.get('/report/live', {
        params: {
            attendance_date: moment().format("YYYY-MM-DD")
        }
    }).then(function(res) {
        $scope.todosreport = res.data.todos;
        $scope.tasks = [];
        $scope.userlists = [];
        var userlists = [];
        angular.forEach($scope.todosreport, function(todo) {
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
