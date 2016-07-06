technocubeAttendance.controller('reportWorkLogCtrl', ['$scope', '$http', function($scope, $http) {
    var queryParam = (window.location.href).split('?')[1];
    console.log("queryParam = ", queryParam);
    var from_date = "";
    var to_date = "";

    queryParam = queryParam.split('&');
    var queryJson = {};
    console.log("queryParam = ", queryParam);
    for (var i = 0, j = queryParam.length; i < j; i++) {
        var fragments = queryParam[i].split("=");
        queryJson[fragments[0]] = fragments[1];
    }
    from_date = queryJson.from_date || moment(moment().subtract('10', 'days')).format("YYYY-MM-DD");
    to_date = queryJson.to_date || moment().format("YYYY-MM-DD");
    $http.get('/report/work_log', {
        params: {
            from_date: from_date || moment(moment().subtract('10', 'days')).format("YYYY-MM-DD"),
            to_date: to_date || moment().format("YYYY-MM-DD")
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
