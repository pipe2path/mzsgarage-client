var app = angular.module('gdalert', [/*'angularSpinner',*/ 'angularUtils.directives.dirPagination']);

app.controller('DashboardCtrl', ['$scope', '$timeout', '$http', '$q', '$filter', 'DashboardStats',
    function($scope, $timeout, $http, $q, $filter, DashboardStats) {

        //$scope.data = { "timestamp": "2016/09/18 18:00", "status":"1"};
        $scope.garagePic = {"captureTimestamp": "", "imagePath": ""};

        pollData();
        getOpenings();

        function pollData() {
            DashboardStats.poll().then(function(data) {
                $scope.statusData = data;
                $timeout(pollData, 1000);
            });
        }

        $scope.refreshStatus = function(){
            pollData();
        }

        $scope.openingsData = { response: { } };
        function getOpenings(){
            var url = 'https://mzsgarage-service.herokuapp.com/openings?id=1&rows=25'
            return $http.get(url).then(function (responseData) {
                $scope.openingsData.response = responseData.data;
                $scope.toggle = true;
            })
        }

        $scope.getLast = function(){
            getOpenings();
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

            // run the promises after waiting for 20 seconds after the first call (so the the image can be uploaded)
            $q.when(needImage()).then($timeout(getImage, 20000));
        }

        $scope.toggle = true;
        $scope.$watch('toggle', function() {
            $scope.toggleText = $scope.toggle ? 'Status History' : 'Refreshing ...';
        });

}]);

app.filter("filterdate", function() {
    var re = /\/Date\(([0-9]*)\)\//;
    return function(x) {
        var m = x.match(re);
        if( m ) return new Date(parseInt(m[1]));
        else return null;
    };
});

app.factory('DashboardStats', ['$http', '$timeout', function($http, $timeout) {
    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

    var data = { response: { }, calls: 0 };

    var poller = function () {
        var url = 'https://mzsgarage-service.herokuapp.com/status?id=1'
        return $http.get(url).then(function (responseData) {
            data.calls++;
            data.response = responseData.data[0];
            return data;
        })
    };

    return {
        poll: poller
    }
}]);

