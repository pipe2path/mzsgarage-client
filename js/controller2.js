var app = angular.module('gdalert', []);

app.controller('DashboardCtrl', ['$scope', '$timeout', '$http', 'DashboardStats',
			function($scope, $timeout, $http, DashboardStats) {
    
	$scope.data = { "timestamp": "2016/09/18 18:00", "status":"1"};
    $scope.garagePic = {"timestamp": "", "image": ""};

    pollData();

    function pollData() {
    	DashboardStats.poll().then(function(data) {
            $scope.statusData = data;
            $timeout(pollData, 1000);
        });
    }

    $scope.takePicture = function(){
        var garagePic = null;

        $http({ method: 'POST',
            url: 'https://mzsgarage-service.herokuapp.com/needimage'})
            .then(function successCallback(response){}, function errorCallback(response){});


        delay(5000);

        // get the image from s3
        $http({ method: 'GET',
            url: 'https://mzsgarage-service.herokuapp.com/getImage'})



        return $scope.garagePic = garagePic;
    }

}]);

app.factory('DashboardStats', ['$http', '$timeout', function($http, $timeout) {
    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

    var data = { response: { }, calls: 0 };

    var poller = function () {
		var url = 'https://mzsgarage-service.herokuapp.com/status'
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

