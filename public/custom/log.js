angular.module('app').controller('LogCtrl', ['$scope','$ngBootbox' ,'$http','socket_url','$interval','$filter','$timeout',
    function($scope,$ngBootbox,$http ,socket_url,$interval,$filter,$timeout) {
        var socket = io.connect(socket_url);

        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
            $interval.cancel(stopTime);

        });

        $http.get('/api/logs')
            .success(function(data) {
                $scope.logs = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        socket.on('update-client-log', function() {
            $http.get('/api/logs')
                .success(function(data) {
                    $scope.logs = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        });


        $http.get('/api/server_time/')
            .success(function(data) {
                $scope.date = data ;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        var tick = function() {
            $http.get('/api/server_time/')
                .success(function(data) {
                    $scope.date = data ;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }
        var stopTime = $interval(tick,1000);



        $scope.get_hour = function(time_in,time_out){
            var miliseconds = time_out - time_in ;
            var seconds = Math.floor(miliseconds / 1000);
            var days = Math.floor(seconds / 86400);
            var hours = Math.floor((seconds % 86400) / 3600);
            var minutes = Math.floor(((seconds % 86400) % 3600) / 60);
            var s = Math.floor(seconds - minutes*60 - hours*3600 - days*86400 );
            var timeString = '';
            if(days > 0) { timeString += "Lúc " + $filter('date')(time_in, " HH:mm:ss") +" Ngày " + $filter('date')(time_in, "dd-MM-yyyy")}else
            if(hours > 0){ timeString += (hours + " giờ trước" ) } else
            if(minutes > 0) { timeString +=  (minutes + " phút trước") } else
            if(s >= 0) timeString +=  (s + " giây trước")
            return timeString;
        }

        $scope.currentPage = 1;
        var reduce_size = 325 ;
        var min_size = 7 ;
        var height = 51 ;
        if(Math.round(($(window).height()-reduce_size)/height) > min_size){
            $scope.pageSize = Math.round(($(window).height()-reduce_size)/height) ;
        }else{
            $scope.pageSize = min_size ;
        }
        $(window).resize(function(){
            $timeout(function() {
                if(Math.round(($(window).height()-reduce_size)/height) > min_size){
                    $scope.pageSize = Math.round(($(window).height()-reduce_size)/height) ;
                }else{
                    $scope.pageSize = min_size ;
                }
            }, 10);

        })
        $scope.pageChanged = function(currentPage) {
            $scope.currentPage = currentPage;
        }


    }
]);