'use strict';

angular.module('app').controller('StoreDetailCtrl', ['$scope','$stateParams','$ngBootbox' ,'$http','socket_url','toaster','$location','$state','$timeout',
    function($scope,$stateParams,$ngBootbox,$http ,socket_url,toaster,$location,$state,$timeout ) {
        var socket = io.connect(socket_url);
        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
        });
        if($stateParams.id){
            $http.get('/api/get_stores/'+$stateParams.id)
                .success(function(data) {
                    if(data){
                        $scope.store = data ;
                    }else{
                        $state.go('app.store')
                    }
                })
        }
        //----------------

        $http.get('/api/services_store')
            .success(function(data) {
                $scope.services_store = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
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
        $scope.store_date = new Date().getTime();
        $scope.add_service = function(){
            $scope.code = '';
            $scope.data= {} ;
            $scope.data.price = 0 ;
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                className: 'ser-pop',
                templateUrl: 'tpl/custom/store/addservice.html',
                title: 'Thêm Sản Phẩm Cho Đợt Nhập Hàng ' + $scope.store.name
            });
        }
        $scope.set_scope = function(key,value){
            $scope[key] = value ;
        }
        $scope.add_ser_have = function(ser , store){
            $http.post('/api/get_services_store/',{code : ser.code , store_id : store._id } )
                .success(function(data) {
                    if(data != null){
                        $ngBootbox.alert('Sản Phẩm Với Mã Sản Phẩm Này Đã Tồn Tại !')
                    }else{
                        $http.post('/api/services_store',{data :{
                                create : new Date().getTime(),
                                name : ser.name,
                                code : ser.code,
                                price : ser.price,
                                supplier : ser.supplier,
                                dvt : ser.dvt,
                                qty : 0,
                                price_extra : ser.price_extra,
                                store_name : store.name,
                                store_date : $scope.store_date,
                                store_id : store._id
                            }})
                            .success(function(data) {
                                socket.emit('update-server',{node : 'service_store'});
                            })
                    }
                })

        }
        $scope.add_ser = function(store,type){
            if(!$scope.form_service.$valid){
                $ngBootbox.alert(' Vui Lòng Nhập Đầy Đủ Thông Tin !')
            }else{
                $http.post('/api/get_services_store/',{code : $scope.data.code , store_id : store._id } )
                    .success(function(data) {
                        if(data != null){
                            $ngBootbox.alert('Sản Phẩm Với Mã Sản Phẩm Này Đã Tồn Tại !')
                        }else{
                            $http.post('/api/services_store',{data :{
                                    create : new Date().getTime(),
                                    name : $scope.data.name,
                                    code : $scope.data.code,
                                    price : $scope.data.price,
                                    supplier : $scope.supplier,
                                    qty : $scope.data.qty,
                                    dvt : $scope.data.dvt,
                                    price_extra : $scope.data.price_extra,
                                    store_name : store.name,
                                    store_date : new Date().getTime(),
                                    store_id : store._id
                                } })
                                .success(function(data) {
                                    socket.emit('update-server',{node : 'service_store'});
                                    if(type=='none'){
                                        $ngBootbox.hideAll();
                                    }else if(type=='new'){
                                        $scope.data.name = '' ;
                                        $scope.data.code = '' ;
                                        $scope.data.qty = 0 ;
                                        $scope.data.price = 0 ;
                                    }
                                })
                        }
                    })

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
        $scope.show_code = true ;
        $scope.show_name = true ;
        $scope.show_category = true ;
        $scope.show_price = true ;
        $scope.show_date = true ;
        $scope.show_store = true ;
        $scope.show_extra = true ;

        if($(window).width() <= 1024 ){
            var reduce_size = 600 ;
        }else{
            var reduce_size = 500 ;
        }
        var min_size = 3 ;
        var height = 37 ;
        if(Math.round(($(window).height()-reduce_size)/height) > min_size){
            $scope.pageSize = Math.round(($(window).height()-reduce_size)/height) ;
        }else{
            $scope.pageSize = min_size ;
        }
        $(window).resize(function(){
            if($(window).width() <= 1024 ){
                var reduce_size = 600 ;
                $scope.show_chiphi = false ;
                $scope.show_mua = false ;
            }else{
                var reduce_size = 520 ;
                $scope.show_chiphi = true ;
                $scope.show_mua = true ;
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
        $scope.rulefilter = function (store) {
            return ($scope.session_user.role == 'admin' || $scope.session_user.name == store.create_by);
        }

        $scope.view_detail_excel = function(){
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                className: 'ser-pop pop-mod',
                templateUrl: 'tpl/custom/store/detail_excel.html',
                title: 'Chi Tiết Upload File '
            });
        }

        $scope.alert_now = new Date().getTime()
        $scope.read_excel = function (excel,store) {
            $scope.success =  0 ;
            $scope.error =  0 ;
            $scope.have =  0 ;
            $scope.now_per =  0 ;
            $scope.now_sp =  0 ;
            $scope.detail_have = new Array() ;
            $scope.detail_success = new Array() ;
            $scope.detail_error = new Array() ;
            if(excel){
                var dem = 0 ;
                $http.post('/read_excel' ,{  value : excel.base64 }).success(function(data){
                    var i = 0 ;
                    angular.forEach(data, function (ser){
                        i ++ ;
                        $timeout(function(){
                            $http.post('/api/check_supplier/' ,{ 'key' : 'name' ,value : ser['Nhà Cung Cấp'] })
                                .success(function(data) {
                                    if(data){
                                        ser['Nhà Cung Cấp'] = data ;
                                    }
                                })

                            dem ++ ;
                            $scope.now_sp =  dem ;
                            $scope.now_per =  dem / data.length *100 ;
                            $timeout(function(){
                                $http.post('/api/get_services_store/',{code : ser['Mã Sản Phẩm'] , store_id : store._id } )
                                    .success(function(data_have) {
                                        if(data_have != null){
                                            $scope.have =  $scope.have + 1 ;
                                            $scope.detail_have.push(data_have ) ;
                                        }else{
                                            $http.post('/api/services_store',{data : {
                                                    create : new Date().getTime(),
                                                    name : ser['Tên Sản Phẩm'],
                                                    code : ser['Mã Sản Phẩm'],
                                                    price :  ser['Giá Mua'],
                                                    supplier :  ser['Nhà Cung Cấp'],
                                                    dvt :  ser['Đơn Vị Tính'],
                                                    ncs : '',
                                                    qty :  ser['Số Lượng'],
                                                    price_extra :  ser['Chi Phí Thêm'],
                                                    store_name : store.name,
                                                    store_date : $scope.store_date,
                                                    store_id : store._id
                                                } })
                                                .success(function(data) {
                                                    $scope.alert_now = new Date().getTime() ;
                                                    socket.emit('update-server',{node : 'service_store'});
                                                    $scope.success =  $scope.success + 1;
                                                    $scope.detail_success.push( {
                                                        create : new Date().getTime(),
                                                        name : ser['Tên Sản Phẩm'],
                                                        code : ser['Mã Sản Phẩm'],
                                                        price :  ser['Giá Mua'],
                                                        supplier :  ser['Nhà Cung Cấp'],
                                                        dvt :  ser['Đơn Vị Tính'],
                                                        ncs : '',
                                                        qty :  ser['Số Lượng'],
                                                        price_extra :  ser['Chi Phí Thêm'],
                                                        store_name : store.name,
                                                        store_date : $scope.store_date,
                                                        store_id : store._id
                                                    }) ;
                                                })
                                                .error(function(data) {
                                                    console.log('Error: ' + data);
                                                    $scope.error =  $scope.error + 1 ;
                                                    $scope.detail_error.push( {
                                                        create : new Date().getTime(),
                                                        name : ser['Tên Sản Phẩm'],
                                                        code : ser['Mã Sản Phẩm'],
                                                        price :  ser['Giá Mua'],
                                                        supplier :  ser['Nhà Cung Cấp'],
                                                        dvt :  ser['Đơn Vị Tính'],
                                                        ncs : '',
                                                        qty :  ser['Số Lượng'],
                                                        price_extra :  ser['Chi Phí Thêm'],
                                                        store_name : store.name,
                                                        store_date : $scope.store_date,
                                                        store_id : store._id
                                                    } ) ;
                                                });
                                        }
                                    })


                            },500)
                        },i*200)

                    })

                })
            }
        }
    }
]);
