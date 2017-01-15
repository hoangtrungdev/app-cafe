'use strict';

angular.module('app').controller('CouponCtrl',  ['$scope','$ngBootbox' ,'$http','socket_url',
    function($scope,$ngBootbox,$http ,socket_url ) {
        var socket = io.connect(socket_url);
        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
        });
        socket.on('update-client', function() {
            $http.get('/api/coupons')
                .success(function(data) {
                    $scope.coupons = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        });
        // when landing on the page, get all todos and show
        $scope.add_coupon = function(){
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                className: 'd-pop',
                templateUrl: 'tpl/custom/coupon/add_coupon.html',
                title: 'Thêm Coupon '
            });
        }
        $http.get('/api/coupons')
            .success(function(data) {
                $scope.coupons = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });

        //
        $scope.type = 'value';
        $scope.add = function() {
            $http.post('/api/logs', {
                active : "Thêm Coupon " + $scope.code,
                time : new Date().getTime(),
                type : 'info',
                coupon : $scope.session_user.name
            }) .success(function(data) {
                    socket.emit('update-server',{node : 'log'});
                })
            $http.post('/api/coupons', {
                code : $scope.code,
                start : new Date($scope.start).getTime(),
                end : new Date($scope.end).getTime(),
                type : $scope.type,
                value : $scope.value
            })
                .success(function(data) {
                    socket.emit('update-server');
                    $ngBootbox.hideAll();
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        //update
        $scope.edit_detail = function(key,id){
            var value = $("#"+key+id).val();
            $http.post('/api/update_coupons/' ,{id : id , key : key , value : value})
                .success(function(data) {
                    //  socket.emit('update-server');
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        $scope.update_mod = function(key,id,value){
            $http.post('/api/update_coupons/' ,{id : id , key : key , value : value})
                .success(function(data) {
                    //  socket.emit('update-server');
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        $scope.edit_date = function(key,id,value){
            $http.post('/api/update_coupons/' ,{id : id , key : key , value : new Date(value).getTime()})
                .success(function(data) {
                    //  socket.emit('update-server');
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        $scope.change_status = function(id,value){
            $http.post('/api/update_coupons/' ,{id : id , key : 'status' , value : value})
                .success(function(data) {
                    socket.emit('update-server');
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

        // delete a coupon after checking it
        $scope.del = function(coupon) {
            $http.post('/api/logs', {
                active : "Xóa Coupon " + coupon.code,
                time : new Date().getTime(),
                type : 'warning',
                coupon : $scope.session_user.name
            }) .success(function(data) {
                    socket.emit('update-server',{node : 'log'});
                })
            $http.delete('/api/coupons/' + coupon._id)
                .success(function(data) {
                    socket.emit('update-server');
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        $scope.edit_coupon = function(id){
            if( $scope.edit_coupon_id == null){
                $scope.edit_coupon_id = id;
            }else{
                if($scope.edit_coupon_id != id){
                    $scope.edit_coupon_id = id;
                }else if($scope.edit_coupon_id != null){
                    $scope.edit_coupon_id = null;
                }
                socket.emit('update-server');
            }
        };
        //-------------------------------
        $scope.open = function($event,opened) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope[opened] = true;
        };
        $scope.opened = [] ;
        $scope.open_mod = function($event,opened) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened[opened] = true;
        };
        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            class: 'datepicker'
        };

        $scope.format = 'dd-MM-yyyy';
    }
]);