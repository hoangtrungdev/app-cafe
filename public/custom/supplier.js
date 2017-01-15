'use strict';
angular.module('app').controller('SupplierCtrl', ['$scope','$ngBootbox' ,'$http','socket_url',
    function($scope,$ngBootbox,$http ,socket_url ) {
        var socket = io.connect(socket_url);
        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
        });
        $http.get('/api/services_store')
            .success(function(data) {
                $scope.services = data;
            })
        socket.on('update-client-service_store', function() {
            $http.get('/api/services_store')
                .success(function(data) {
                    $scope.services = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        });


        socket.on('update-client-supplier', function() {
            $http.get('/api/suppliers')
                .success(function(data) {
                    $scope.suppliers = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        });

        $scope.view_detail = function(id){
            $scope.view_now = id ;
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                className: 'class-full-mod',
                templateUrl: 'tpl/custom/supplier/view_detail.html',
                title: 'Chi Tiết '
            });
        };
        $scope.add_sup = function(){
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                className: 'd-pop',
                templateUrl: 'tpl/custom/supplier/add_supplier.html',
                title: 'Thêm Nhà Cung Cấp '
            });
        };


        // when landing on the page, get all todos and show them
        $http.get('/api/suppliers')
            .success(function(data) {
                $scope.suppliers = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });

//
        $scope.add = function() {
            $http.post('/api/suppliers', {
                code : $scope.code,
                name : $scope.name,
                address : $scope.address,
                email : $scope.email ,
                phone : $scope.phone
            }) .success(function(data) {
                socket.emit('update-server',{node : 'supplier'});
                $ngBootbox.hideAll();
            })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
//update
        $scope.edit_detail = function(key,id){
            var value = $("#"+key+id).val();
            $http.post('/api/update_suppliers/' ,{id : id , key : key , value : value})
                .success(function(data) {
                    //  socket.emit('update-server');
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };


// delete a supplier after checking it
        $scope.del = function(id) {
            $http.delete('/api/suppliers/' + id)
                .success(function(data) {
                    socket.emit('update-server',{node : 'supplier'});
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        $scope.edit_supplier = function(id){
            if( $scope.edit_supplier_id == null){
                $scope.edit_supplier_id = id;
            }else{
                if($scope.edit_supplier_id != id){
                    $scope.edit_supplier_id = id;
                }else if($scope.edit_supplier_id != null){
                    $scope.edit_supplier_id = null;
                }
                socket.emit('update-server',{node : 'supplier'});
            }
        };
        //-------------------
        $scope.currentPage_ck = 1;
        $scope.pageSize_ck = 5 ;
        $scope.pageChanged_ck = function(currentPage_ck) {
            $scope.currentPage_ck = currentPage_ck;
        }
        // pagination ----------------------------------
        $scope.set_scope = function(key,value){
            $scope[key] = value ;
        }
        $scope.data_show = 2 ;

        $scope.currentPage = 1;
        $scope.pageSize = 10;
        $scope.pageChanged = function(currentPage) {
            $scope.currentPage = currentPage;
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
