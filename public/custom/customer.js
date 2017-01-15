'use strict';

angular.module('app').controller('CustomerCtrl', ['$scope','$ngBootbox' ,'$http','socket_url','$timeout',
    function($scope,$ngBootbox,$http ,socket_url,$timeout ) {
        var socket = io.connect(socket_url);
        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
        });

        $http.get('/api/checkouts')
            .success(function(data) {
                $scope.checkouts = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        socket.on('update-client-checkout', function() {
            $http.get('/api/checkouts')
                .success(function(data) {
                    $scope.checkouts = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        });


        socket.on('update-client-customer', function() {
            $http.get('/api/customers')
                .success(function(data) {
                    $scope.customers = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        });
        // when landing on the page, get all todos and show them
        $http.get('/api/customers')
            .success(function(data) {
                $scope.customers = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });

        //
        $scope.add_customer = function(){
            $scope.code = 'cus-' + new Date().getTime();
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                className: 'd-pop',
                templateUrl: 'tpl/custom/customer/add_customer.html',
                title: 'Thêm Khách Hàng '
            });
        }
        $scope.add = function() {
            $http.post('/api/logs', {
                active : "Thêm Khách Hàng " + $scope.name,
                time : new Date().getTime(),
                type : 'info',
                user : $scope.session_user.name
            }) .success(function(data) {
                socket.emit('update-server',{node : 'log'});
            })
            $http.post('/api/customers', {
                name : $scope.name,
                code : $scope.code,
                email : $scope.email,
                phone : $scope.phone,
                address : $scope.address
            }) .success(function(data) {
                socket.emit('update-server',{node : 'customer'});
                $ngBootbox.hideAll();
            })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        //update
        $scope.edit_detail = function(key,id){
            var value = $("#"+key+id).val();
            $http.post('/api/update_customers/' ,{id : id , key : key , value : value})
                .success(function(data) {
                    //  socket.emit('update-server');
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        $scope.change_status = function(id,value){
            $http.post('/api/update_customers/' ,{id : id , key : 'status' , value : value})
                .success(function(data) {
                    socket.emit('update-server',{node : 'customer'});

                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

        // delete a customer after checking it
        $scope.del = function(customer) {
            $http.post('/api/logs', {
                active : "Xóa Khách Hàng " + customer.name,
                time : new Date().getTime(),
                type : 'warning',
                user : $scope.session_user.name
            }) .success(function(data) {
                socket.emit('update-server',{node : 'log'});
            })
            $http.delete('/api/customers/' + customer._id)
                .success(function(data) {
                    socket.emit('update-server',{node : 'customer'});

                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        $scope.edit_customer = function(id){
            if( $scope.edit_customer_id == null){
                $scope.edit_customer_id = id;
            }else{
                if($scope.edit_customer_id != id){
                    $scope.edit_customer_id = id;
                }else if($scope.edit_customer_id != null){
                    $scope.edit_customer_id = null;
                }
                socket.emit('update-server',{node : 'customer'});

            }
        };
        //-------------------
        $scope.currentPage_ck = 1;
        $scope.pageSize_ck = 5 ;
        $scope.pageChanged_ck = function(currentPage_ck) {
            $scope.currentPage_ck = currentPage_ck;
        }
        //--------------------------
        $scope.currentPage = 1;
        if($(window).width() <= 1024 ){
            var reduce_size = 280 ;
            $scope.tablet_hide = true ;
        }else{
            var reduce_size = 350 ;
            $scope.tablet_hide = false ;

        }
        var min_size = 7 ;
        var height = 37 ;
        if(Math.round(($(window).height()-reduce_size)/height) > min_size){
            $scope.pageSize = Math.round(($(window).height()-reduce_size)/height) ;
        }else{
            $scope.pageSize = min_size ;
        }
        $(window).resize(function(){
            if($(window).width() <= 1024 ){
                var reduce_size = 280 ;
                $scope.tablet_hide = true ;
            }else{
                var reduce_size = 350 ;
                $scope.tablet_hide = false ;

            }
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
        $scope.rulefilter = function (customer) {
            return ($scope.session_user.role == 'admin' || $scope.session_user.name == customer.create_by);
        }
    }
]);
angular.module("app")
    .filter('sumOfValue', function () {
        return function (data, key) {
            if (typeof (data) === 'undefined' || typeof (key) === 'undefined') {
                return 0;
            }
            var sum = 0;
            for (var i = 0; i < data.length; i++) {
                sum = sum + parseInt(data[i][key]);
            }
            return sum;
        }
    })
angular.module('app').filter("datefilter", function() {
    return function(items, from, to) {
        if(from && to){
            var df = from;
            var dt = to;
            var arrayToReturn = [];
            for (var i=0; i<items.length; i++){
                if ( df.getTime() < items[i].date && items[i].date < dt.getTime() + 24*60*60*1000)  {
                    arrayToReturn.push(items[i]);
                }
            }
            return arrayToReturn ;
        }else{
            return items ;
        }
    };
});