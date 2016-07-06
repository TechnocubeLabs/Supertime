technocubeAttendance.controller("loginCtrl", ['$scope', function($scope) {
    $scope.validateRegistrationDetails = function() {
        jQuery('input[name=attendance_date]').val(moment().format("YYYY-MM-DD"));
        jQuery('input[name=login_time]').val(moment().format("YYYY-MM-DD HH:mm:ss"));
    }
}]);
