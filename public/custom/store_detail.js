'use strict';

angular.module('app').controller('StoreDetCtrl', ['$scope','$stateParams','$ngBootbox' ,'$http','socket_url','toaster','$location','$state','$timeout',
    function($scope,$stateParams,$ngBootbox,$http ,socket_url,toaster,$location,$state ,$timeout ) {
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
        //-------------------------------
        $scope.update_emit = function(){
            socket.emit('update-server',{node : 'service_store'});
        }
        $scope.edit_service = function(id){
            $scope.edit_ser = false ;
            if( $scope.edit_service_id == null){
                $scope.edit_service_id = id;
            }else{
                if($scope.edit_service_id != id){
                    $scope.edit_service_id = id;
                }else if($scope.edit_service_id != null){
                    $scope.edit_service_id = null;
                }
            }
        };

        $scope.set_scope = function(key,value){
            $scope[key] = value ;
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
        $scope.upload_img = function (id , img) {
            if(img != null){
                $http.post('/upload' ,{ 'filetype' : img.filetype ,'filename' : id+img.filename , value : img.base64})
                    .success(function(abc) {
                        $http.post('/api/update_services_store/' ,{id : id , key : 'img' , value : id+img.filename}).success(function(abc) {
                            socket.emit('update-server',{node : 'service_store'});
                        })
                    })
            }
        };
        //---------------------------------
        var removeElements = function(text, selector) {
            var wrapped = $("<table>" + text + "</table>");
            wrapped.find(selector).remove();
            return wrapped.html();
        }

        var tableToExcel = (function() {
            var uri = 'data:application/vnd.ms-excel;base64,'
                , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
                , base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) }
                , format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) }
            return function(table, name) {
                if (!table.nodeType) table = document.getElementById(table)
                var c = table.innerHTML;
                c = removeElements(c,'tfoot');
                //console.log(c);
                var ctx = {worksheet: name || 'Worksheet', table: c}
                return uri + base64(format(template, ctx))
            }
        })()

        $scope.exportData = function () {
            $scope.exportHref = tableToExcel("extable",'BaoCao');
            $timeout(function() {
                var link = document.createElement('a');
                link.download = "export.xls";
                link.href = $scope.exportHref;
                link.click();
            }, 100);
        };
        //-------------------------------------
        $scope.del_all = function(){
            angular.forEach($scope.services_store, function(service) {
                if(service.check == true){
                    $http.delete('/api/services_store/' + service._id)
                        .success(function(data) {
                            socket.emit('update-server',{node : 'service_store'});
                        })
                }
            });
        }
        $scope.copy = function(service){
            $http.get('/api/check_service/' + service.code)
                .success(function(data) {
                    if(data != null){
                        var options = {
                            message: 'Mã Sản Phẩm ' +data.code +' Đã Tồn Tại , Vui Lòng Kiểm Tra Tại Trang Sản Phẩm  !!!! !',
                            buttons: {
                                warning: {
                                    label: "Trở Lại"
                                },
                                success: {
                                    label: "Xem Chi Tiết Sản Phẩm" ,
                                    className: "btn-primary",
                                    callback: function(){
                                        $ngBootbox.hideAll()
                                        $state.go('app.service',{code : data._id})
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
        // pagination ----------------------------------
        $scope.set_scope = function(key,value){
            $scope[key] = value ;
        }
        $scope.show_code = true ;
        $scope.show_name = true ;
        $scope.show_date = true ;
        $scope.show_price = true ;
        $scope.show_category = true ;
        $scope.show_store = true ;
        $scope.show_extra = true ;

        $scope.currentPage = 1;
        $scope.load_resize = function(){
            if($(window).width() <= 1024 ){
                var reduce_size = 280 ;
            }else{
                var reduce_size = 350 ;

            }
            var min_size = 7 ;
            var height = 37 ;
            if(Math.round(($(window).height()-reduce_size)/height) > min_size){
                $scope.pageSize = Math.round(($(window).height()-reduce_size)/height) ;
            }else{
                $scope.pageSize = min_size ;
            }
        }
        $scope.load_resize()
        $(window).resize(function(){
            $timeout( $scope.load_resize , 10);
        })
        $scope.pageChanged = function(currentPage) {
            $scope.currentPage = currentPage;
        }

        //-------------------------------
        $scope.open = function($event,opened) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope[opened] = true;
        };

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            class: 'datepicker'
        };

        $scope.format = 'dd-MM-yyyy';

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