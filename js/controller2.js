var app = angular.module('gdalert', []);

app.controller('DashboardCtrl', ['$scope', '$timeout', '$http', '$q', '$filter', 'DashboardStats',
    function($scope, $timeout, $http, $q, $filter, DashboardStats) {

        $scope.data = { "timestamp": "2016/09/18 18:00", "status":"1"};
        $scope.garagePic = {"timestamp": "", "imagePath": ""};

        pollData();

        function pollData() {
            DashboardStats.poll().then(function(data) {
                $scope.statusData = data;
                $timeout(pollData, 1000);
            });
        }

        $scope.takePicture = function(){
            var imageCaptureId;

            function needImage() {
                $http({
                    method: 'POST',
                    url: 'https://mzsgarage-service.herokuapp.com/needimage'
                })
                    .then(function successCallback(response) {
                            imageCaptureId = response.data;
                        },
                        function errorCallback(response) {
                        });
            };


            // get the image from s3
            function getImage() {
                $http({
                    method: 'GET',
                    url: 'https://mzsgarage-service.herokuapp.com/image?id=' + imageCaptureId
                })
                    .then(function successCallback(response) {
                            $scope.garagePic.imagePath = response.data.imagePath;
                        },
                        function errorCallback(response) {
                        });
            };

            // run the promises after waiting for 10 seconds after the first call (so the the image can be uploaded)
            $q.when(needImage()).then($timeout(getImage, 10000));
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

