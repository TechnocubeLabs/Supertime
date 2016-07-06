technocubeAttendance.controller('reportAttendanceCtrl', ['$scope', '$http', function($scope, $http) {
    $http.get('/report/attendance').then(function(res) {
        $scope.attendance = res.data.attendance;
        var users = [];
        angular.forEach($scope.attendance || [], function(attendance) {
            if (users.indexOf(attendance.user.username) == -1) {
                users.push(attendance.user.username);
            }
        });
        $scope.users = users;
    }, function(err) {
        alert("You session had expired or something went wrong. Please login and try again.");
        window.location.href = "/";
    });

    $scope.clearFilter = function() {
        $scope.status = "";
    };

}]);
