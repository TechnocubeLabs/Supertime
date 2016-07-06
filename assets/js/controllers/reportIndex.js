/*indexReport.js*/

technocubeAttendance.controller('reportIndexCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.$watch('begin_date', function() {
        $scope.mindate_end = $scope.begin_date;
    });
    $scope.maxdate_begin = $scope.maxdate_end = new Date();
    $scope.$watch('end_date', function() {
        $scope.maxdate_begin = $scope.end_date;
    });
    $scope.applyDateFilter = function(page) {
        var begin_date = moment($scope.begin_date).format("YYYY-MM-DD");
        var end_date = moment($scope.end_date).format("YYYY-MM-DD");
        window.location.href = (window.location.href).split("?")[0] + "?page=" + page + "&from_date=" + begin_date + "&to_date=" + end_date;
    }
}]);
