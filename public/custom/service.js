'use strict';

angular.module('app').controller('ServiceCtrl', ['$scope','$ngBootbox' ,'$http','socket_url','$timeout','toaster','$base64','$stateParams',
    function($scope,$ngBootbox,$http ,socket_url,$timeout,toaster,$base64 ,$stateParams) {
        var socket = io.connect(socket_url);
        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
        });
        if($stateParams.code){
            $scope.code_now =  $stateParams.code;
            $scope.edit_service_id = $stateParams.code ;
        }
        if($stateParams.type){
            $scope.type =  $stateParams.type;
        }else{
            $scope.type =  'doan';
        }

        socket.on('update-client-service', function() {
            $http.get('/api/services')
                .success(function(data) {
                    $scope.services = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        });
        socket.on('update-client-category', function() {
            $http.get('/api/categorys')
                .success(function(data) {
                    $scope.categorys = data;
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
        //--------------------------------------------------
        $scope.custom_filter = [{name : 'Hết Hàng' , value : 0 },{name : 'Sắp Hết Hàng' , value : 10 }];
        $scope.filter_sl = function (ser) {
           if(!$scope.cus_fil){
              return true ;
           }else{
               if( $scope.cus_fil.value == 0){
                   return ( ( ser.qty - ser.sell ) == 0);
               }else{
                   return ($scope.cus_fil.value >= ( ser.qty - ser.sell ) && ( ser.qty - ser.sell ) > 0 );
               }
           }
        }
        
        //--------------------------------------------------

        $http.get('/api/services_store')
            .success(function(data) {
                $scope.services_store = data;
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
        //-----------------------
        $scope.add_date = function(){
            angular.forEach($scope.services, function(ser) {
                if(ser.create == undefined){
                    $http.post('/api/update_services/' ,{id : ser._id , key : 'create' , value : 1450088080700})
                }
            })
        }
        $scope.add_service = function(){
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
                templateUrl: 'tpl/custom/service/addservice.html',
                title: 'Thêm Sản Phẩm '
            });
        }
        $scope.edit_nc = function(service){
            $scope.now = service;
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                templateUrl: 'tpl/custom/service/edit_nc.html',
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
                $http.post('/api/update_services/' ,{id : now._id , key : 'ncs' , value : now.ncs})
                    .success(function(data) {
                        socket.emit('update-server',{node : 'service'});
                        $ngBootbox.hideAll();
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
            }
        }

        $scope.add = function(type) {
            if(!$scope.form_service.$valid){
                $ngBootbox.alert(' Vui Lòng Nhập Đầy Đủ Thông Tin !')
            }else{
                $http.get('/api/check_service/' + $scope.data.code)
                    .success(function(data) {
                        if(data != null){
                            $ngBootbox.alert(' Mã Sản Phẩm Này Đã Tồn Tại !!!!')
                        }else{
                            $http.post('/api/logs', {
                                active : "Thêm Sản Phẩm " + $scope.data.name,
                                time : new Date().getTime(),
                                type : 'info',
                                user : $scope.session_user.name
                            }) .success(function(data) {
                                    socket.emit('update-server',{node : 'log'});
                                })
                            var img_value = '' ;
                            if($scope.data.img != null){
                                var img = $scope.data.img;
                                $http.post('/upload' ,{ 'filetype' : img.filetype ,'filename' : $scope.data.code+img.filename , value : img.base64}) ;
                                img_value = $scope.data.code+$scope.data.img.filename ;
                            }

                            $http.post('/api/services',{
                                create : new Date().getTime(),
                                name : $scope.data.name,
                                code : $scope.data.code,
                                price : $scope.data.price,
                                category : $scope.category,
                                img : img_value,
                                ncs : $scope.ncs
                            })
                                .success(function(data) {
                                    socket.emit('update-server',{node : 'service'});
                                    if(type=='none'){
                                        $ngBootbox.hideAll();
                                    }else if(type=='new'){
                                        $scope.data.name = '' ;
                                        $scope.data.code = '' ;
                                        $scope.data.qty = 0 ;
                                        $scope.data.price_mua = 0 ;
                                        $scope.data.price_chiphi = 0 ;
                                        $scope.data.price = 0 ;
                                        $scope.data.price_si = 0 ;
                                    }
                                })
                                .error(function(data) {
                                    console.log('Error: ' + data);
                                });
                        }
                    });
            }

        };
        //update
        $scope.update_emit = function(){
            socket.emit('update-server',{node : 'service'});
        }
        $scope.edit_detail = function(key,id){
            if(key == 'max'){
                var value = $("#"+key+id._id).val();
                $http.post('/api/update_services/' ,{id : id._id , key : 'qty' , value : value*1 + id.sell*1})
                    .success(function(data) {
                        //  socket.emit('update-server');
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
            }else{
                var value = $("#"+key+id).val();
                $http.post('/api/update_services/' ,{id : id , key : key , value : value})
                    .success(function(data) {
                        //  socket.emit('update-server');
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
            }

        };
        $scope.update_mod = function(key,id,value){
            $http.post('/api/update_services/' ,{id : id , key : key , value : value})
                .success(function(data) {
                    //  socket.emit('update-server');
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });

        };
        $scope.change_status = function(id,value){
            $http.post('/api/update_services/' ,{id : id , key : 'status' , value : value})
                .success(function(data) {
                    socket.emit('update-server',{node : 'service'});
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

        // delete a service after checking it
        $scope.del = function(service) {
            $http.post('/api/logs', {
                active : "Xóa Sản Phẩm " + service.name,
                time : new Date().getTime(),
                type : 'warning',
                user : $scope.session_user.name
            }) .success(function(data) {
                    socket.emit('update-server',{node : 'log'});
                })
            $http.delete('/api/services/' + service._id)
                .success(function(data) {
                    socket.emit('update-server',{node : 'service'});
                    toaster.pop('info','Thông Báo !','Xóa Thành Công');

                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
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


        // pagination ----------------------------------
        $scope.set_scope = function(key,value){
            $scope[key] = value ;
        }
        $scope.data_show = 2 ;

        $scope.show_code = true ;
        $scope.show_name = true ;
        $scope.show_category = true ;
        $scope.show_supplier = true ;
        $scope.show_gia = true ;
        $scope.show_date = true ;
        $scope.show_store = true ;

        $scope.currentPage = 1;
        $scope.load_resize = function(){
            if($(window).width() <= 1024 ){
                var reduce_size = 240 ;
                $scope.show_le = false ;
                $scope.show_si = false ;
                $scope.show_supplier = false ;
                if(window.innerHeight > window.innerWidth){
                    $scope.show_store = false ;
                    $scope.show_von = false ;
                }
            }else{
                var reduce_size = 310 ;
                $scope.show_le = true ;
                $scope.show_si = true ;
                $scope.show_category = true ;
                $scope.show_supplier = true ;
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
        $scope.open_date = Array() ;
        $scope.open = function($event,opened) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.open_date[opened] = true;

        };

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            class: 'datepicker'
        };

        $scope.format = 'dd-MM-yyyy';

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

        $scope.actionChooseCate = function(cate){
            if($scope.filter_cate ==  cate.code){
                $scope.filter_cate = '' ;
            }else{
                $scope.filter_cate = cate.code ;
            }
        }
        $scope.exportData = function () {
            $scope.exportHref = tableToExcel("extable",'BaoCao');
            $timeout(function() {
                var link = document.createElement('a');
                link.download = "export.xls";
                link.href = $scope.exportHref;
                link.click();
            }, 100);
        };

        $scope.upload_img = function (id , img) {
            if(img != null){
                $http.post('/upload' ,{ 'filetype' : img.filetype ,'filename' : id+img.filename , value : img.base64})
                    .success(function(abc) {
                        $http.post('/api/update_services/' ,{id : id , key : 'img' , value : id+img.filename}).success(function(abc) {
                            socket.emit('update-server',{node : 'service'});
                        })
                    })
            }
        };
        $scope.cate = new Array();
        $scope.check_cate = function(cate , key , title){
            if(cate[key] == null || cate[key] == ''){
                $scope['cate_'+key+'_err'] = false ;
                $scope['cate_'+key+'_alert'] = 'Vui lòng điền thông tin ' + title + ' !';
            }else{
                $http.post('/api/check_category/' ,{ 'key' : key ,value : cate[key] })
                    .success(function(data) {
                        if(data == null){
                            $scope['cate_'+key+'_err'] = true ;
                            $scope['cate_'+key+'_alert'] ='';
                        }else{
                            $scope['cate_'+key+'_err'] = false ;
                            $scope['cate_'+key+'_alert'] = title + ' đã tồn tại !';

                        }
                    })
            }
        }
        $scope.sup = new Array();
        $scope.check_sup = function(sup , key , title){
            if(sup[key] == null || sup[key] == ''){
                $scope['sup_'+key+'_err'] = false ;
                $scope['sup_'+key+'_alert'] = 'Vui lòng điền thông tin ' + title + ' !';
            }else{
                $http.post('/api/check_supplier/' ,{ 'key' : key ,value : sup[key] })
                    .success(function(data) {
                        if(data == null){
                            $scope['sup_'+key+'_err'] = true ;
                            $scope['sup_'+key+'_alert'] ='';
                        }else{
                            $scope['sup_'+key+'_err'] = false ;
                            $scope['sup_'+key+'_alert'] = title + ' đã tồn tại !';

                        }
                    })
            }
        }

        $scope.add_category = function(cate) {
            $http.post('/api/logs', {
                active : "Thêm Category " + cate.name,
                time : new Date().getTime(),
                type : 'info',
                user : $scope.session_user.name
            }) .success(function(data) {
                    socket.emit('update-server',{node : 'log'});
                })
            $http.post('/api/categorys', {
                code : cate.code,
                name :cate.name
            }).success(function(data) {
                    $scope.category =  {
                        code : cate.code,
                        name :cate.name
                    }
                    socket.emit('update-server',{node : 'category'});
                })
        };
        $scope.add_supplier = function(sup) {
            $http.post('/api/suppliers', {
                code : sup.code,
                name : sup.name,
                address : sup.address,
                email : sup.email ,
                phone : sup.phone
            }) .success(function(data) {
                    $scope.supplier =  {
                        code : sup.code,
                        name : sup.name,
                        address : sup.address,
                        email : sup.email ,
                        phone : sup.phone
                    }
                    socket.emit('update-server',{node : 'supplier'});
                })
        };

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
