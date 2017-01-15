 'use strict';

angular.module('app').controller('StoreCtrl', ['$scope','$ngBootbox' ,'$http','socket_url','toaster','$location',
    function($scope,$ngBootbox,$http ,socket_url,toaster,$location ) {
        var socket = io.connect(socket_url);
        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
        });
        socket.on('update-client-service_store', function() {
            $http.get('/api/services_store')
                .success(function(data) {
                    $scope.services_store = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        });
        $http.get('/api/services_store')
            .success(function(data) {
                $scope.services_store = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });

        //----------------
        $scope.show_code = true ;
        $scope.show_name = true ;
        $scope.show_category = true ;
        $scope.show_supplier = true ;
        $scope.show_chiphi = true ;
        $scope.show_mua = true ;
        $scope.show_date = true ;

        $scope.show_store = true ;

        $http.get('/api/server_time/')
            .success(function(data) {
                $scope.date = data ;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        $http.get('/api/services')
            .success(function(data) {
                $scope.services = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        socket.on('update-client-service', function() {
            $http.get('/api/services')
                .success(function(data) {
                    $scope.services = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        });

        //-----------------------------------
        socket.on('update-client-store', function() {
            $http.get('/api/stores')
                .success(function(data) {
                    $scope.stores = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        });
        // when landing on the page, get all todos and show them
        $http.get('/api/stores')
            .success(function(data) {
                $scope.stores = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        // add service
        $http.get('/api/categorys')
            .success(function(data) {
                $scope.categorys = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        $http.get('/api/suppliers')
            .success(function(data) {
                $scope.suppliers = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        //-----------------------------------
        $scope.goto_store = function(id){
            setTimeout(function(){
                $("#store_click_"+id).click()
            }, 10)

        }
        $scope.all_store = function(store){
            $http.get('/api/services_store')
                .success(function(data) {
                    $scope.services_store = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                className: 'class-full-mod',
                templateUrl: 'tpl/custom/store/all.html',
                title: 'Chi Tiết Tất Cả '
            });
        }
        $scope.detail_store = function(store){
            socket.on('update-client-service_store', function() {
                $http.get('/api/services_store')
                    .success(function(data) {
                        $scope.services_store = data;
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
            });
            $http.get('/api/services_store')
                .success(function(data) {
                    $scope.services_store = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
            $scope.store = store ;
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                className: 'class-full-mod',
                templateUrl: 'tpl/custom/store/detail.html',
                title: 'Chi Tiết Đợt Nhập Hàng - ' + store.name
            });
        }
        $scope.add_service = function(){
            $scope.code = '';
            $scope.data= {} ;
            $scope.data.qty = 0 ;
            $scope.data.price_mua = 0 ;
            $scope.data.price_chiphi = 0 ;
            $scope.data.price = 0 ;
            $scope.data.price_si = 0 ;
            $scope.ncs = Array();
            $scope.tinhtong = function(){
                $scope.data.price_von = $scope.data.price_mua*1 + $scope.data.price_chiphi*1 ;
            }
            $scope.add_nc = function(){
                $scope.ncs.push({nc_qty : 1 ,_id : 'nc' + new Date().getTime() })
            }
            $scope.del_nc = function(nc){
                var index = $scope.ncs.indexOf(nc);
                $scope.ncs.splice(index, 1);
            }
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                className: 'ser-pop',
                templateUrl: 'tpl/custom/store/addservice.html',
                title: 'Thêm Sản Phẩm Cho Đợt Nhập Hàng'
            });
        }
        $scope.add_ser = function(store){
            if(!$scope.form_service.$valid){
                $ngBootbox.alert(' Vui Lòng Nhập Đầy Đủ Thông Tin !')
            }else{

                $http.post('/api/services_store',{
                    create : new Date().getTime(),
                    name : $scope.data.name,
                    code : $scope.data.code,
                    price : $scope.data.price,
                    price_mua : $scope.data.price_mua,
                    price_chiphi : $scope.data.price_chiphi,
                    price_von : $scope.data.price_mua + $scope.data.price_chiphi,
                    price_si : $scope.data.price_si,
                    category : $scope.data.category,
                    supplier : $scope.data.supplier,
                    ncs : $scope.ncs,
                    qty : $scope.data.qty,
                    store_name : store.name,
                    store_id : store._id
                })
                    .success(function(data) {
                        socket.emit('update-server',{node : 'service_store'});
                        $('#close').click() ;
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
            }
        }
        $scope.edit_detail_ser = function(key,id){
            if(key == 'max'){
                var value = $("#"+key+id._id).val();
                $http.post('/api/update_services_store/' ,{id : id._id , key : 'qty' , value : value*1 + id.sell*1})
                    .success(function(data) {
                    })
            }else{
                var value = $("#"+key+id).val();
                $http.post('/api/update_services_store/' ,{id : id , key : key , value : value})
                    .success(function(data) {
                    })
            }

        };
        $scope.update_mod_ser = function(key,id,value){
            $http.post('/api/update_services_store/' ,{id : id , key : key , value : value})
                .success(function(data) {
                })
        };

        $scope.del_ser = function(service) {
            $http.delete('/api/services_store/' + service._id)
                .success(function(data) {
                    socket.emit('update-server',{node : 'service_store'});
                })
        };
        $scope.edit_ser = function(id){
            if( $scope.edit_service_id == null){
                $scope.edit_service_id = id;
            }else{
                if($scope.edit_service_id != id){
                    $scope.edit_service_id = id;
                }else if($scope.edit_service_id != null){
                    $scope.edit_service_id = null;
                }
                socket.emit('update-server',{node : 'service_store'});
            }
        };
        $scope.edit_nc = function(service){
            $scope.now = service;
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                templateUrl: 'tpl/custom/store/edit_nc.html',
                title: 'Chỉnh Sửa'
            });
            $scope.add_nc_update = function(){
                $scope.now.ncs.push({nc_qty : 1 ,_id : 'nc' + new Date().getTime() })
            }
            $scope.del_nc_update = function(nc){
                var index =  $scope.now.ncs.indexOf(nc);
                $scope.now.ncs.splice(index, 1);
            }
            $scope.update_nc = function(now){
                $http.post('/api/update_services_store/' ,{id : now._id , key : 'ncs' , value : now.ncs})
                    .success(function(data) {
                        socket.emit('update-server',{node : 'service_store'});
                        $('#close').click() ;
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
            }
        }

        $scope.copy = function(service){
            $http.get('/api/check_service/' + service.code)
                .success(function(data) {
                    if(data != null){
                        var options = {
                            message: 'Mã Sản Phẩm Này Đã Tồn Tại , Vui Lòng Kiểm Tra Tại Trang Sản Phẩm  !!!! !',
                            buttons: {
                                warning: {
                                    label: "Trở Lại"
                                },
                                success: {
                                    label: "Đến Trang Sản Phẩm",
                                    className: "btn-primary",
                                    callback: function(){
                                        $ngBootbox.hideAll()
                                        $('#service_a').click();
                                    }
                                }
                            }
                        };

                        $ngBootbox.customDialog(options);

                    }else{
                        $http.post('/api/services',{
                            create : new Date().getTime(),
                            name : service.name,
                            code : service.code,
                            price : service.price,
                            price_mua : service.price_mua,
                            price_chiphi : service.price_chiphi,
                            price_von : service.price_mua + service.price_chiphi,
                            price_si : service.price_si,
                            category : service.category,
                            supplier : service.supplier,
                            ncs : service.ncs,
                            qty : service.qty
                        })
                            .success(function(data) {
                                socket.emit('update-server',{node : 'service'});
                                toaster.pop('info','Thông Báo !','Cập Nhật Sản Phẩm Thành Công !!!');
                            })
                    }
                })
        }

        //-----------------------------------

        $scope.add_store = function(){
            $scope.code = 'store-' + new Date().getTime();
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                className: 'd-pop',
                templateUrl: 'tpl/custom/store/add_store_old.html',
                title: 'Thêm Đợt Nhập Hàng'
            });
        }


        $scope.add = function() {
            $http.post('/api/logs', {
                active : "Thêm Đợt Nhập Hàng " + $scope.name,
                time : new Date().getTime(),
                type : 'info',
                user : $scope.session_user.name
            }) .success(function(data) {
                    socket.emit('update-server',{node : 'log'});
                })
            $http.post('/api/stores', {
                name : $scope.name,
                code : $scope.code,
                user :  $scope.session_user  ,
                date :   $scope.date ,
                note : $scope.note
            }) .success(function(data) {
                    socket.emit('update-server',{node : 'store'});
                    $ngBootbox.hideAll();
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        //update
        $scope.edit_detail = function(key,id){
            var value = $("#"+key+id).val();
            $http.post('/api/update_stores/' ,{id : id , key : key , value : value})
                .success(function(data) {
                    //  socket.emit('update-server');
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        $scope.change_status = function(id,value){
            $http.post('/api/update_stores/' ,{id : id , key : 'status' , value : value})
                .success(function(data) {
                    socket.emit('update-server',{node : 'store'});

                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

        // delete a store after checking it
        $scope.del = function(store) {
            $http.post('/api/logs', {
                active : "Xóa Khách Hàng " + store.name,
                time : new Date().getTime(),
                type : 'warning',
                user : $scope.session_user.name
            }) .success(function(data) {
                    socket.emit('update-server',{node : 'log'});
                })
            $http.delete('/api/stores/' + store._id)
                .success(function(data) {
                    socket.emit('update-server',{node : 'store'});

                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        $scope.edit_store = function(id){
            if( $scope.edit_store_id == null){
                $scope.edit_store_id = id;
            }else{
                if($scope.edit_store_id != id){
                    $scope.edit_store_id = id;
                }else if($scope.edit_store_id != null){
                    $scope.edit_store_id = null;
                }
                socket.emit('update-server',{node : 'store'});

            }
        };
        //--------------------------
        $scope.currentPage = 1;
        $scope.pageSize = 15;
        $scope.pageChanged = function(currentPage) {
            $scope.currentPage = currentPage;
        }
        $scope.rulefilter = function (store) {
            return ($scope.session_user.role == 'admin' || $scope.session_user.name == store.create_by);
        }

    }
]);
 angular.module('app').filter("datefilter", function() {
     return function(items, from, to) {
         if(from && to){
             var df = from;
             var dt = to;
             var arrayToReturn = [];
             for (var i=0; i<items.length; i++){
                 if ( df.getTime() < items[i].create && items[i].create < dt.getTime() + 24*60*60*1000)  {
                     arrayToReturn.push(items[i]);
                 }
             }
             return arrayToReturn ;
         }else{
             return items ;
         }
     };
 });

