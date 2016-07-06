/*
 *
 *  breaks.js
 *
 */

technocubeAttendance.controller('breakCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.setBreakData = function() {
        jQuery('input[name=start_time]').val(moment().format("YYYY-MM-DD HH:mm:ss"));
        jQuery('input[name=attendance_date]').val(moment().format("YYYY-MM-DD"));
    };

    $scope.getbreaks = function() {
        $http.post('/breaks/getbreaks', {
            attendance_date: moment().format('YYYY-MM-DD')
        }).then(function(res) {
            $scope.breaks = res.data.breaks;
        }, function(err) {

        });
    };

    $scope.getbreaks();

    $scope.endbreak = function(break_id) {
        $http.post('/breaks/endBreak', {
            break_id: break_id,
            end_time: moment().format("YYYY-MM-DD HH:mm:ss")
        }).then(function(res) {
            $scope.getbreaks();
        }, function(err) {
            alert("You session had expired. please login and try again.");
            window.location.href = "/";
        });
    };
}]);
