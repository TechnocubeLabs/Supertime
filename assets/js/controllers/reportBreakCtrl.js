/*reportBreakCtrl.js*/

technocubeAttendance.controller('reportBreakCtrl', ['$scope', '$http', function($scope, $http) {
    $http.get('/report/breaks').then(function(res) {
        $scope.breaks = res.data.breaks;
        var users = [];
        angular.forEach($scope.breaks || [], function(breaks) {
            if (users.indexOf(breaks.user) == -1) {
                users.push(breaks.user);
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
