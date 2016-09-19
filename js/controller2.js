var app = angular.module('gdalert', []);

app.controller('DashboardCtrl', ['$scope', '$timeout', '$http', 'DashboardStats',
			function($scope, $timeout, $http, DashboardStats) {
    
	$scope.data = { "timestamp": "2016/09/18 18:00", "status":"1"};

    pollData();

    function pollData() {
    	DashboardStats.poll().then(function(data) {
            $scope.statusData = data;
            $timeout(pollData, 1000);
        });
    }
}]);

app.factory('DashboardStats', ['$http', '$timeout', function($http, $timeout) {
    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

    var data = { response: { }, calls: 0 };

    var poller = function (bathroomId) {
		var url = 'https://gdalertservice.herokuapp.com/status/'
        return $http.get(url).then(function (responseData) {
            data.calls++;
            data.response = responseData.data[0];

            return data;
        });
    };

    return {
        poll: poller
    }
}]);

