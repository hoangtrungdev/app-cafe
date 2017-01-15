 'use strict';

angular.module('app').controller('OutputCtrl', ['$scope','$ngBootbox' ,'$http','socket_url','toaster','$location',
    function($scope,$ngBootbox,$http ,socket_url,toaster,$location ) {
        var socket = io.connect(socket_url);
        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
        });
        //----------------
        socket.on('update-client-service_store', function() {
            $http.get('/api/services_store')
                .success(function(data) {
                    $scope.services_store = data;
                })
        });
        $http.get('/api/services_store')
            .success(function(data) {
                $scope.services_store = data;
            })
        //----------------
        socket.on('update-client-service_output', function() {
            $http.get('/api/services_output')
                .success(function(data) {
                    $scope.services_output = data;
                })
        });
        $http.get('/api/services_output')
            .success(function(data) {
                $scope.services_output = data;
            })
        //----------------
        $scope.show_code = true ;
        $scope.show_name = true ;
        $scope.show_category = true ;
        $scope.show_supplier = true ;
        $scope.show_chiphi = true ;
        $scope.show_mua = true ;
        $scope.show_date = true ;
        $scope.show_store = true ;

        //-----------------------------------
        socket.on('update-client-output', function() {
            $http.get('/api/outputs')
                .success(function(data) {
                    $scope.outputs = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        });
        // when landing on the page, get all todos and show them
        $http.get('/api/outputs')
            .success(function(data) {
                $scope.outputs = data;
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

        $scope.all_output = function(output){
            $http.get('/api/services_output')
                .success(function(data) {
                    $scope.services_output = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                className: 'class-full-mod',
                templateUrl: 'tpl/custom/output/all.html',
                title: 'Chi Tiết Tất Cả '
            });
        }
        $scope.detail_output = function(output){
            socket.on('update-client-service_output', function() {
                $http.get('/api/services_output')
                    .success(function(data) {
                        $scope.services_output = data;
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
            });
            $http.get('/api/services_output')
                .success(function(data) {
                    $scope.services_output = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
            $scope.output = output ;
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                className: 'class-full-mod',
                templateUrl: 'tpl/custom/output/detail.html',
                title: 'Chi Tiết Đợt Nhập Hàng - ' + output.name
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
                templateUrl: 'tpl/custom/output/addservice.html',
                title: 'Thêm Sản Phẩm Cho Đợt Nhập Hàng'
            });
        }
        $scope.add_ser = function(output){
            if(!$scope.form_service.$valid){
                $ngBootbox.alert(' Vui Lòng Nhập Đầy Đủ Thông Tin !')
            }else{

                $http.post('/api/services_output',{
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
                    output_name : output.name,
                    output_id : output._id
                })
                    .success(function(data) {
                        socket.emit('update-server',{node : 'service_output'});
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

        $scope.add_output = function(){
            $scope.code = 'output-' + new Date().getTime();
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                className: 'd-pop',
                templateUrl: 'tpl/custom/output/add_output_old.html',
                title: 'Thêm Đợt Xuất Hàng'
            });
        }


        $scope.actionSubmitAdd = function() {
            $http.post('/api/logs', {
                active : "Thêm Đợt Xuất Hàng " + $scope.name,
                time : new Date().getTime(),
                type : 'info',
                user : $scope.session_user.name
            }) .success(function(data) {
                    socket.emit('update-server',{node : 'log'});
            })
            $http.post('/api/outputs', {
                name : $scope.name,
                code : $scope.code,
                user :  $scope.session_user  ,
                date :    new Date().getTime(),
                note : $scope.note
            }) .success(function(data) {
                    socket.emit('update-server',{node : 'output'});
                    $ngBootbox.hideAll();
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        //update
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
        $scope.pageSize = 15;
        $scope.pageChanged = function(currentPage) {
            $scope.currentPage = currentPage;
        }
        $scope.rulefilter = function (output) {
            return ($scope.session_user.role == 'admin' || $scope.session_user.name == output.create_by);
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
