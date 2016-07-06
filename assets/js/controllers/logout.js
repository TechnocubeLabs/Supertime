/*
*
*	logout.js
*
*/

technocubeAttendance.controller('headerCtrl', ['$scope', function($scope){
	$scope.logout = function(){
		jQuery('input[name=attendance_date').val(moment().format("YYYY-MM-DD"));
		jQuery('input[name=logout_time').val(moment().format("YYYY-MM-DD HH:mm:ss"));
	}	
}])