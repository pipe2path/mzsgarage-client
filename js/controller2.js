var app = angular.module('gdalert', ['angularSpinner']);

app.controller('DashboardCtrl', ['$scope', '$timeout', '$http', '$q', '$filter', 'DashboardStats',
    function($scope, $timeout, $http, $q, $filter, DashboardStats) {

        //$scope.data = { "timestamp": "2016/09/18 18:00", "status":"1"};
        $scope.garagePic = {"captureTimestamp": "", "imagePath": ""};

        pollData();

        function pollData() {
            DashboardStats.poll().then(function(data) {
                $scope.statusData = data;
                $timeout(pollData, 1000);
            });
        }

        $scope.refreshStatus = function(){
            pollData();
        }

        $scope.takePicture = function(){
            var imageCaptureId;
            var capturedDate;

            $scope.showSpinner = true;
            function needImage() {
                $http({
                    method: 'POST',
                    url: 'https://mzsgarage-service.herokuapp.com/needimage?garageid=1'
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
                            capturedDate = response.data.captureCompleted;
                            $scope.garagePic.captureTimestamp = capturedDate;
                            $scope.toggle = true;
                            $scope.showSpinner = false;
                        },
                        function errorCallback(response) {
                        });
            };

            // run the promises after waiting for 10 seconds after the first call (so the the image can be uploaded)
            $q.when(needImage()).then($timeout(getImage, 30000));
        }

        $scope.toggle = true;
        $scope.$watch('toggle', function() {
            $scope.toggleText = $scope.toggle ? 'Take picture' : 'Taking picture ...';
        });
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

