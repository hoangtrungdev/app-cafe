'use strict';

angular.module('app').controller('ServiceTamCtrl', ['$scope','$ngBootbox' ,'$http','socket_url','$timeout','toaster','$base64','$stateParams',
    function($scope,$ngBootbox,$http ,socket_url,$timeout,toaster,$base64 ,$stateParams) {
        var socket = io.connect(socket_url);
        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
        });


        socket.on('update-client-service_tam', function() {
            $http.get('/api/service_tam')
                .success(function(data) {
                    $scope.service_tam = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        });

        $http.get('/api/service_tam')
            .success(function(data) {
                $scope.service_tam = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });

        // delete a service after checking it
        $scope.del = function(service) {
            $http.delete('/api/del_service_tam/' + service._id)
                .success(function(data) {
                    socket.emit('update-server',{node : 'service_tam'});
                    toaster.pop('info','Thông Báo !','Xóa Thành Công');
                })
        };
        $scope.del_list = function() {
            angular.forEach($scope.service_tam, function(service) {
                if(service.check == true){
                    $http.delete('/api/del_service_tam/' + service._id) ;
                    socket.emit('update-server',{node : 'service_tam'});
                }
            })
        };
        $scope.del_all = function() {
            angular.forEach($scope.service_tam, function(service) {
                    $http.delete('/api/del_service_tam/' + service._id) ;
                    socket.emit('update-server',{node : 'service_tam'});
            })
        };

    }
]);

