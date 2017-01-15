'use strict';

angular.module('app').controller('OutputDetailCtrl', ['$scope','$stateParams','$ngBootbox' ,'$http','socket_url','toaster','$location','$state','$timeout',
    function($scope,$stateParams,$ngBootbox,$http ,socket_url,toaster,$location,$state,$timeout ) {
        var socket = io.connect(socket_url);
        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
        });
        if($stateParams.id){
            $http.get('/api/get_outputs/'+$stateParams.id)
                .success(function(data) {
                    if(data){
                        $scope.output = data ;
                    }else{
                        $state.go('app.output')
                    }
                })
        }
        //----------------

        $http.get('/api/services_output')
            .success(function(data) {
                $scope.services_output = data;
            })
        socket.on('update-client-service_output', function() {
            $http.get('/api/services_output')
                .success(function(data) {
                    $scope.services_output = data;
                })
        });
        //----------------

        $http.get('/api/services_store')
            .success(function(data) {
                $scope.services_store = data;
            })
        socket.on('update-client-service_store', function() {
            $http.get('/api/services_store')
                .success(function(data) {
                    $scope.services_store = data;
                })
        });
        //----------------

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
        $scope.output_date = new Date().getTime();
        $scope.add_service = function(){
            $scope.code = '';
            $scope.data= {} ;
            $scope.data.price = 0 ;
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                className: 'ser-pop',
                templateUrl: 'tpl/custom/output/addservice.html',
                title: 'Thêm Sản Phẩm Cho Đợt Nhập Hàng ' + $scope.output.name
            });
        }
        $scope.set_scope = function(key,value){
            $scope[key] = value ;
        }
        $scope.add_ser_have = function(ser , output){
            $http.post('/api/get_services_output/',{code : ser.code , output_id : output._id } )
                .success(function(data) {
                    if(data != null){
                        if(data.store_id == ser.store_id){
                            $ngBootbox.alert('Sản Phẩm Của Đợt Nhập Này Đã Tồn Tại !')
                        }else{
                            $http.post('/api/services_output',{data :{
                                    create : new Date().getTime(),
                                    name : ser.name,
                                    code : ser.code,
                                    price : ser.price,
                                    supplier : ser.supplier,
                                    dvt : ser.dvt,
                                    qty : 0,
                                    price_extra : ser.price_extra,
                                    store_name : ser.store_name,
                                    store_id : ser.store_id ,
                                    output_name : output.name,
                                    output_date : $scope.output_date,
                                    output_id : output._id
                                }})
                                .success(function(data) {
                                    socket.emit('update-server',{node : 'service_output'});
                                })
                        }
                    }else{
                        $http.post('/api/services_output',{data :{
                                create : new Date().getTime(),
                                name : ser.name,
                                code : ser.code,
                                price : ser.price,
                                supplier : ser.supplier,
                                dvt : ser.dvt,
                                qty : 0,
                                price_extra : ser.price_extra,
                                store_name : ser.store_name,
                                store_id : ser.store_id ,
                                output_name : output.name,
                                output_date : $scope.output_date,
                                output_id : output._id
                            }})
                            .success(function(data) {
                                socket.emit('update-server',{node : 'service_output'});
                            })
                    }
                })

        }

        $scope.edit_detail_ser = function(key,id){
            if(key == 'max'){
                var value = $("#"+key+id._id).val();
                $http.post('/api/update_services_output/' ,{id : id._id , key : 'qty' , value : value*1 + id.sell*1})
                    .success(function(data) {
                    })
            }else{
                var value = $("#"+key+id).val();
                $http.post('/api/update_services_output/' ,{id : id , key : key , value : value})
                    .success(function(data) {
                    })
            }

        };
        $scope.update_mod_ser = function(key,id,value){
            $http.post('/api/update_services_output/' ,{id : id , key : key , value : value})
                .success(function(data) {
                })
        };

        $scope.del_ser = function(service) {
            $http.delete('/api/services_output/' + service._id)
                .success(function(data) {
                    socket.emit('update-server',{node : 'service_output'});
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
                socket.emit('update-server',{node : 'service_output'});
            }
        };
        $scope.edit_nc = function(service){
            $scope.now = service;
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                templateUrl: 'tpl/custom/output/edit_nc.html',
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
                $http.post('/api/update_services_output/' ,{id : now._id , key : 'ncs' , value : now.ncs})
                    .success(function(data) {
                        socket.emit('update-server',{node : 'service_output'});
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
            $http.post('/api/update_outputs/' ,{id : id , key : key , value : value})
                .success(function(data) {
                    //  socket.emit('update-server');
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        $scope.change_status = function(id,value){
            $http.post('/api/update_outputs/' ,{id : id , key : 'status' , value : value})
                .success(function(data) {
                    socket.emit('update-server',{node : 'output'});

                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

        // delete a output after checking it
        $scope.del = function(output) {
            $http.post('/api/logs', {
                active : "Xóa Khách Hàng " + output.name,
                time : new Date().getTime(),
                type : 'warning',
                user : $scope.session_user.name
            }) .success(function(data) {
                socket.emit('update-server',{node : 'log'});
            })
            $http.delete('/api/outputs/' + output._id)
                .success(function(data) {
                    socket.emit('update-server',{node : 'output'});

                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        $scope.edit_output = function(id){
            if( $scope.edit_output_id == null){
                $scope.edit_output_id = id;
            }else{
                if($scope.edit_output_id != id){
                    $scope.edit_output_id = id;
                }else if($scope.edit_output_id != null){
                    $scope.edit_output_id = null;
                }
                socket.emit('update-server',{node : 'output'});

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
        $scope.rulefilter = function (output) {
            return ($scope.session_user.role == 'admin' || $scope.session_user.name == output.create_by);
        }

        $scope.view_detail_excel = function(){
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                className: 'ser-pop pop-mod',
                templateUrl: 'tpl/custom/output/detail_excel.html',
                title: 'Chi Tiết Upload File '
            });
        }

        $scope.alert_now = new Date().getTime()
        $scope.read_excel = function (excel,output) {
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
                                $http.post('/api/get_services_output/',{code : ser['Mã Sản Phẩm'] , output_id : output._id } )
                                    .success(function(data_have) {
                                        if(data_have != null){
                                            $scope.have =  $scope.have + 1 ;
                                            $scope.detail_have.push(data_have ) ;
                                        }else{
                                            $http.post('/api/services_output',{
                                                    create : new Date().getTime(),
                                                    name : ser['Tên Sản Phẩm'],
                                                    code : ser['Mã Sản Phẩm'],
                                                    price :  ser['Giá Mua'],
                                                    supplier :  ser['Nhà Cung Cấp'],
                                                    ncs : '',
                                                    qty :  ser['Số Lượng'],
                                                    price_coupon :  ser['Chi Phí Thêm'],
                                                    output_name : output.name,
                                                    output_date : $scope.output_date,
                                                    output_id : output._id
                                                })
                                                .success(function(data) {
                                                    $scope.alert_now = new Date().getTime() ;
                                                    socket.emit('update-server',{node : 'service_output'});
                                                    $scope.success =  $scope.success + 1;
                                                    $scope.detail_success.push( {
                                                        create : new Date().getTime(),
                                                        name : ser['Tên Sản Phẩm'],
                                                        code : ser['Mã Sản Phẩm'],
                                                        price :  ser['Giá Mua'],
                                                        supplier :  ser['Nhà Cung Cấp'],
                                                        ncs : '',
                                                        qty :  ser['Số Lượng'],
                                                        price_coupon :  ser['Chi Phí Thêm'],
                                                        output_name : output.name,
                                                        output_date : $scope.output_date,
                                                        output_id : output._id
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
                                                        ncs : '',
                                                        qty :  ser['Số Lượng'],
                                                        price_coupon :  ser['Chi Phí Thêm'],
                                                        output_name : output.name,
                                                        output_date : $scope.output_date,
                                                        output_id : output._id
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
angular.module("app")
    .filter('sumValueServiceOutput', function () {
        return function (data) {

            if (typeof (data) === 'undefined' ) {
                return 0;
            }
            var sum = 0;

            for (var i = 0; i < data.length; i++) {
                sum = sum + parseInt(data[i]['qty']*data[i]['price'] );
            }
            return sum;
        }
    })
