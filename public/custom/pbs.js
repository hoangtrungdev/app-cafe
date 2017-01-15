'use strict';

angular.module('app').controller('PbsCtrl', ['$scope','$ngBootbox' ,'$http','socket_url','$stateParams','$timeout','$state','toaster','$filter','$window','$cookieStore','hotkeys',
    function($scope,$ngBootbox,$http ,socket_url,$stateParams,$timeout,$state,toaster ,$filter,$window,$cookieStore,hotkeys) {
        var socket = io.connect(socket_url);

        document.onkeydown = function(evt) {
            if (evt.keyCode == 112) {  // F1 was pressed
                $scope.method = !$scope.method ;
                return false ;
            }
            if (evt.keyCode == 113) {  // F2 was pressed
                $("#paid").focus();
                return false ;

            }
            if (evt.keyCode == 114) {  // F3 was pressed
                $("#coupon").focus();
                return false ;

            }
            if (evt.keyCode == 115) {  // F4 was pressed
                $scope.add_bill();
                return false ;
            }
            if (evt.keyCode == 27) {  // F4 was pressed
                $scope.del_bill();
                return false ;
            }
        }

        ///----------------------
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


        //--------------------------
        $scope.tra_hang = function(){
            $scope.method = false;
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                className: 'd-tra d-pop',
                templateUrl: 'tpl/default_tra.html',
                title: 'Nhập Hàng Trả'
            });
        }

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
        $scope.currentPage_ck = 1;
        $scope.pageSize_ck = 7 ;
        $scope.pageChanged_ck = function(currentPage) {
            $scope.currentPage_ck = currentPage;
        }
        //-----------
        $window.onbeforeunload  = function () {
            angular.forEach($scope.bills, function(bill) {
                angular.forEach($scope.bill_services[bill._id], function(service) {
                    $http.delete('/api/service_tam/' + service._id);
                    socket.emit('update-server',{node : 'service_tam'});
                })
            })
        };
        $scope.$on('$destroy', function (event) {
            angular.forEach($scope.bills, function(bill) {
                angular.forEach($scope.bill_services[bill._id], function(service) {
                    $http.delete('/api/service_tam/' + service._id);
                    socket.emit('update-server',{node : 'service_tam'});


                })
            })
            socket.removeAllListeners();
        });
        $http.get('/api/services')
            .success(function(data) {
                $scope.services = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });

        //---------------------------
        $http.get('/api/categorys')
            .success(function(data) {
                $scope.categorys = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        // pagination ----------------------------------
        $scope.set_scope = function(key,value){
            $scope[key] = value ;
        }

        $scope.currentPage = 1;
        $scope.pageSize = Math.round(($(window).height()-260)/140)*3 ;
        $(window).resize(function(){
            $scope.pageSize = Math.round(($(window).height()-260)/140)*3 ;
        })
        $scope.pageChanged = function(currentPage) {
            $scope.currentPage = currentPage;
        }

        //---------------------------------

        $scope.edit_config = function(key){
            var value = $("#config_"+key).val();
            $http.post('/api/update_config/' ,{ key : key , value : value})
                .success(function(data) {
                    //  socket.emit('update-server');
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        $scope.config = {} ;
        $http.get('/api/globals')
            .success(function(data) {
                angular.forEach(data, function(config) {
                    $scope.config[config.key] = config.value ;
                })
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });

        //-------------------------
        $scope.date = new Date().getTime() ;

        $http.get('/api/customers')
            .success(function(data) {
                $scope.customers = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        //----------------------
        $scope.bill_services = Array();
        $scope.bills = Array();
        $scope.date_bill = new Array();
        $scope.coupon = new Array();
        $scope.reduce = new Array();
        $scope.paid = new Array();
        $scope.dem = 0 ;
        $scope.add_bill = function(){
            $scope.dem ++ ;
            var id = 'bill_' + new Date().getTime() ;

            $scope.date_bill[id] = new Date().getTime() ;

            $scope.bills.push({_id : id ,stt : 'Hóa Đơn ' +$scope.dem})
            $scope.bill_services[id] = new Array();
            $scope.paid[id] = 0;
            $scope.reduce[id] = 0;
            $scope.focus_now = $scope.bills[$scope.bills.length - 1]._id;
            $scope.focus_bill = $scope.bills[$scope.bills.length - 1];
        }
        $scope.add_bill();

        $scope.set_focus = function(bill){
            $scope.focus_now = bill._id;
            $scope.focus_bill = bill;
        }
        $scope.del_bill = function(){
            if($scope.bills.length > 1){
                var index = $scope.bills.indexOf($scope.focus_bill);
                $scope.bills.splice(index, 1);
                $scope.focus_now = $scope.bills[$scope.bills.length - 1]._id;
            }else{
                $scope.dem = 0 ;
                var index = $scope.bills.indexOf($scope.focus_bill);
                $scope.bills.splice(index, 1);
                $scope.add_bill();
            }

        }
        $scope.del_this = function(bill){
            angular.forEach($scope.bill_services[bill._id], function(service) {
                $http.delete('/api/service_tam/' + service._id);
                socket.emit('update-server',{node : 'service_tam'});


            })
            if($scope.bills.length > 1){
                var index = $scope.bills.indexOf(bill);
                $scope.bills.splice(index, 1);
                $scope.focus_now = $scope.bills[$scope.bills.length - 1]._id;
            }else{
                $scope.dem = 0 ;
                var index = $scope.bills.indexOf(bill);
                $scope.bills.splice(index, 1);
                $scope.add_bill();
            }

        }
        //----------------------------------------

        //----------------------------------
        $scope.customer = {name : "Khách Vãng Lai" , code : 'Guest' , email : 'Không sử dụng' , phone : 'Không sử dụng' , address : 'Không sử dụng'}
        $scope.customer_choose = function(cus){
            $scope.customer = cus ;
        };
        $scope.add_service = function(){
            $scope.bill_services[$scope.focus_now].push({qty : 1 ,_id : 'service_' + new Date().getTime() })

        }
        //-----------------------------------
        $scope.data = {}
        $scope.add_customer = function(){
            $scope.method = false;
            $scope.code = 'cus-' + new Date().getTime();
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                className: 'd-pop',
                templateUrl: 'tpl/default_customer.html',
                title: 'Thêm Khách Hàng Mới'
            });
        }
        $scope.add_cus_default = function() {

            if(!$scope.form_cus.$valid){
                $ngBootbox.alert(' Vui Lòng Nhập Đầy Đủ Thông Tin !')
            }else{
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
                        $cookieStore.put('cus_now',{
                            name : $scope.name,
                            code : $scope.code,
                            email : $scope.email,
                            phone : $scope.phone,
                            address : $scope.address
                        });
                        socket.emit('update-server',{node : 'customer'});
                        $ngBootbox.hideAll();
                    })
            }
        };
        //--------------------------------------
        socket.on('update-client-customer', function() {
            $scope.cus_now =  $cookieStore.get('cus_now');
            if( $scope.cus_now  !== undefined){
                $scope.customer = $scope.cus_now
                $cookieStore.remove('cus_now');
            }
            $http.get('/api/customers')
                .success(function(data) {
                    $scope.customers = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
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
        //------------
        $scope.change_method = function(){
            $scope.method = false;
        }

        $scope.method = true;
        var tick = function() {
            if($scope.method == true){
                $("#barcode_pbs").focus();
            }
            $timeout(tick,1000);
        }
        tick();
        //------------------
        $scope.check_barcode = function(){
            $http.get('/api/check_service/' + $scope.barcode)
                .success(function(data) {
                    if(data == null){
                        $ngBootbox.alert(' Mã Sản Phẩm Không Tồn Tại !!!!')
                    }else{
                        var not = true ;
                        angular.forEach($scope.bill_services[$scope.focus_now], function(service) {
                            if(service.code == data.code){
                                service.qty = service.qty*1 +1 ;
                                $http.post('/api/check_service_tam/', { code : service.code , hd_id : service._id })
                                    .success(function(data) {
                                        if(!data) {
                                            $http.post('/api/service_tam/',{service_tam : {
                                                name : service.name ,
                                                code : service.code ,
                                                hd_id : service._id  ,
                                                user :  $scope.session_user  ,
                                                created : new Date().getTime(),
                                                value: service.qty}
                                            })
                                            socket.emit('update-server',{node : 'service_tam'});

                                        }else{
                                            $http.post('/api/update_service_tam/',{ code : service.code , hd_id : service._id  , value: service.qty})
                                            socket.emit('update-server',{node : 'service_tam'});

                                        }
                                        $http.post('/api/service_tam_all/', { code : service.code }).success(function(d) {
                                            service.max = service.all - service.sell ;
                                            angular.forEach(d, function(val) {
                                                if(service._id != val.hd_id){
                                                    service.max = service.max - val.value*1 ;
                                                }
                                            })
                                        })
                                    })

                                if(service.qty > service.max){
                                    service.qty = service.max ;
                                    $ngBootbox.alert(' Sản Phẩm ' +service.name +' Chỉ Còn '+service.max+' Sản Phẩm !!!!')
                                }
                                not = false ;
                            }
                        })
                        if(not){
                            data._id = 'service_' + new Date().getTime()
                            $scope.bill_services[$scope.focus_now].push({
                                _id : data._id,
                                name : data.name ,
                                code : data.code ,
                                price : data.price_si ,
                                price_mua : data.price_mua,
                                price_chiphi : data.price_chiphi,
                                all : data.qty,
                                sell : data.sell,
                                ncs : data.ncs,
                                max : data.qty - data.sell,
                                nc : null ,
                                qty : 1
                            })
                            $http.post('/api/service_tam/',{service_tam : { code :  data.code , hd_id :  data._id  , value: 1} })
                            socket.emit('update-server',{node : 'service_tam'});

                        }

                    }

                })
            $scope.barcode = '' ;
            $("#barcode_pbs").focus();
        }

        $scope.del_service = function(service){
            var index = $scope.bill_services[$scope.focus_now].indexOf(service);
            $scope.bill_services[$scope.focus_now].splice(index, 1);
            $http.delete('/api/service_tam/' + service._id)
            socket.emit('update-server',{node : 'service_tam'});


        }
        $scope.service_push = function(data){
            var not = true ;
            angular.forEach($scope.bill_services[$scope.focus_now], function(service) {
                if(service.code == data.code){
                    service.qty = service.qty*1 +1 ;
                    $http.post('/api/check_service_tam/', { code : service.code , hd_id : service._id })
                        .success(function(data) {
                            if(!data) {
                                $http.post('/api/service_tam/',{service_tam : {
                                    name : service.name ,
                                    code : service.code ,
                                    hd_id : service._id  ,
                                    user :  $scope.session_user  ,
                                    created : new Date().getTime(),
                                    value: service.qty}
                                })
                                socket.emit('update-server',{node : 'service_tam'});

                            }else{
                                $http.post('/api/update_service_tam/',{ code : service.code , hd_id : service._id  , value: service.qty})
                                socket.emit('update-server',{node : 'service_tam'});

                            }
                            $http.post('/api/service_tam_all/', { code : service.code }).success(function(d) {
                                service.max = service.all - service.sell ;
                                angular.forEach(d, function(val) {
                                    if(service._id != val.hd_id){
                                        service.max = service.max - val.value*1 ;
                                    }
                                })
                            })
                        })

                    if(service.qty > service.max){
                        service.qty = service.max ;
                        $ngBootbox.alert(' Sản Phẩm ' +service.name +' Chỉ Còn '+service.max+' Sản Phẩm !!!!')
                    }
                    not = false ;
                }
            })
            if(not){
                data._id = 'service_' + new Date().getTime()
                $scope.bill_services[$scope.focus_now].push({
                    _id : data._id,
                    name : data.name ,
                    code : data.code ,
                    price : data.price_si ,
                    price_mua : data.price_mua,
                    price_chiphi : data.price_chiphi,
                    all : data.qty,
                    sell : data.sell,
                    ncs : data.ncs,
                    max : data.qty - data.sell,
                    nc : null ,
                    qty : 1
                })
                $http.post('/api/service_tam/',{service_tam : {
                    name : service.name ,
                    code : service.code ,
                    hd_id : service._id  ,
                    user :  $scope.session_user  ,
                    created : new Date().getTime(),
                    value: service.qty}
                })
                socket.emit('update-server',{node : 'service_tam'});


            }
        }
        $scope.service_choose = function(service,index){
            var ser = $scope.bill_services[$scope.focus_now][index];
            ser.code = service.code;
            ser.price = service.price_si;
            ser.price_mua = service.price_mua;
            ser.price_chiphi = service.price_chiphi;
            ser.name = service.name;
            ser.all = service.qty;
            ser.sell = service.sell;
            ser.ncs = service.ncs;
            ser.nc = null ;
            ser.max =service.qty - service.sell;
            ser.qty = 1;

        }
        $scope.nc_choose = function(nc,index){
            var ser = $scope.bill_services[$scope.focus_now][index];
            ser.nc = nc ;
        }
        $scope.sum = function(object){
            var sum = 0 ;
            angular.forEach(object, function(service) {
                if(service.price){
                    if(service.nc){
                        sum = sum + service.nc.nc_price*service.qty ;
                    }else{
                        sum = sum + service.price*service.qty ;
                    }
                }
            })
            return sum ;
        }
        $scope.sum_mua = function(object){
            var sum_mua = 0 ;
            angular.forEach(object, function(service) {
                if(service.price){
                    if(service.nc){
                        sum_mua = sum_mua +  service.price_mua*service.nc.nc_qty*service.qty ;
                    }else{
                        sum_mua = sum_mua + service.price_mua*service.qty ;
                    }
                }
            })
            return sum_mua ;
        }
        $scope.sum_chiphi = function(object){
            var sum_chiphi = 0 ;
            angular.forEach(object, function(service) {
                if(service.price){
                    if(service.nc){
                        sum_chiphi = sum_chiphi*1 +  service.price_chiphi*service.nc.nc_qty*service.qty ;
                    }else{
                        sum_chiphi = sum_chiphi*1 +  service.price_chiphi*service.qty ;
                    }
                }
            })
            return sum_chiphi ;
        }
        //----------
        $scope.check_coupon = function(coupon){
            $http.get('/api/check_coupon/' + coupon)
                .success(function(data) {
                    if(data != null){
                        if(data.start < new Date().getTime() && data.end > new Date().getTime()){
                            $scope.coupon[$scope.focus_now] = data ;
                            toaster.pop('info','Thông Báo !','Cập Nhật Mã Giảm Giá Thành Công');
                        }else{
                            $ngBootbox.alert(' Mã Giảm Giá Hết Hạn !!!!')
                        }
                    }else{
                        $scope.coupon[$scope.focus_now] = null ;
                    }
                })
        }

        //---------------------------------------------
        $scope.alert_now = new Date().getTime()
        $scope.check_max = function(service,old){
            $http.post('/api/check_service_tam/', { code : service.code , hd_id : service._id })
                .success(function(data) {
                    if(!data) {
                        $http.post('/api/service_tam/',{service_tam : {
                            name : service.name ,
                            code : service.code ,
                            hd_id : service._id  ,
                            user :  $scope.session_user  ,
                            created : new Date().getTime(),
                            value: service.qty}
                        })
                        socket.emit('update-server',{node : 'service_tam'});

                    }else{
                        $http.post('/api/update_service_tam/',{ code : service.code , hd_id : service._id  , value: service.qty})
                        socket.emit('update-server',{node : 'service_tam'});

                    }
                    $http.post('/api/service_tam_all/', { code : service.code }).success(function(d) {
                        service.max = service.all - service.sell ;
                        angular.forEach(d, function(val) {
                            if(service._id != val.hd_id){
                                service.max = service.max - val.value*1 ;
                            }
                        })
                    })
                })

            if(service.qty > service.max){
                service.qty = service.max ;
                if(new Date().getTime() - $scope.alert_now > 1000){
                    $scope.alert_now = new Date().getTime()
                    $ngBootbox.alert(' Sản Phẩm ' +service.name +' Chỉ Còn '+service.max+' Sản Phẩm !!!!')

                }
            }
            if(service.qty < 0){
                service.qty = 0 ;
            }
        }
        $scope.reset = function( ){
            $window.location.reload();
        }
        $scope.status_hide = new Array();
        $scope.save = function(print){
            if(print){
                $scope.printDiv('print-div') ;
            }
            angular.forEach($scope.bill_services[$scope.focus_now], function(service) {
                $http.post('/api/service_sell/',{service : service}) .success(function(data) {
                    socket.emit('update-server',{node : 'service'});
                })
                $http.delete('/api/service_tam/' + service._id);
                socket.emit('update-server',{node : 'service_tam'});


            })
            $scope.status_hide[$scope.focus_now] = true ;
            $http.post('/api/pbs/',{bill : {
                code :  $("#code").val() ,
                total : $scope.sum($scope.bill_services[$scope.focus_now])  ,
                total_mua : $scope.sum_mua($scope.bill_services[$scope.focus_now])  ,
                total_chiphi : $scope.sum_chiphi($scope.bill_services[$scope.focus_now])  ,
                paid : $scope.paid[$scope.focus_now]  ,
                date : $scope.date_bill[$scope.focus_now]  ,
                coupon : $scope.coupon[$scope.focus_now]?$scope.coupon[$scope.focus_now].code:''  ,
                reduce : $scope.reduce[$scope.focus_now]  ,
                services : $scope.bill_services[$scope.focus_now]  ,
                user :  $scope.session_user  ,
                customer :  $scope.customer
            } })
                .success(function(data) {
                    toaster.pop('info','Thông Báo !','Lưu Phiếu Thành Công');
                    socket.emit('update-server',{node : 'pbs'});
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
            $http.post('/api/logs', {
                active : "Lưu Phiếu Bán Hàng "  + $("#code").val() ,
                time : new Date().getTime(),
                type : 'info',
                user : $scope.session_user.name
            }) .success(function(data) {
                    socket.emit('update-server',{node : 'log'});
                })
        }
        //-----------------------------------------
        $scope.printDiv = function(divName) {
            var contents = $("#"+divName).html();
            var frame1 = $('<iframe />');
            frame1[0].name = "frame1";
            frame1.css({ "position": "absolute", "top": "-1000000px" });
            $("body").append(frame1);
            var frameDoc = frame1[0].contentWindow ? frame1[0].contentWindow : frame1[0].contentDocument.document ? frame1[0].contentDocument.document : frame1[0].contentDocument;
            frameDoc.document.open();
            //Create a new HTML document.
            frameDoc.document.write('<html><head><title>DIV Contents</title>');
            frameDoc.document.write('</head><body>');
            //Append the external CSS file.
            frameDoc.document.write('<link href="css/print.css" rel="stylesheet" type="text/css" />');
            frameDoc.document.write('<div id="title-bill">'+$scope.config.name+'</div>');
            frameDoc.document.write('<div class="dive-bill">-------------o0o-------------</div>');
            frameDoc.document.write('<div class="info-bill">'+$scope.config.address+'</div>');
            frameDoc.document.write('<div class="info-bill">Điện Thoại:'+$scope.config.phone+'</div>');
            frameDoc.document.write('<div class="info-bill-mod">'+ $("#code").val()+'</div>');
            frameDoc.document.write('<div class="dive-bill">---------------------------------------</div>');

            frameDoc.document.write(contents);
            frameDoc.document.write('<div class="bbot-bill">-------------------------------------------------------</div>');
            frameDoc.document.write('<div class="bot-thanks-bill">Xin Cảm Ơn Quý Khách  !</div>');
            frameDoc.document.write('<div class="bot-thanks-bill">Thu Ngân : '+$scope.session_user.name+'</div>');
            if($scope.coupon){
                frameDoc.document.write('<div class="bot-thanks-bill">Mã Giảm Giá : '+$scope.coupon.code+'</div>');
            }
            frameDoc.document.write('<div class="bot-date-bill">Ngày :'+$filter('date')( $scope.date , 'dd/MM/yyyy')+' Giờ '+
                $filter('date')($scope.date, 'HH:mm')+' </div>');
            /*
             frameDoc.document.write('<div class="bot-text-bill">Hóa Đơn bán hàng chỉ có giá trị khi quý khách yêu cầu xuất hóa dơn GTGT trong ngày. ' +
             'Hóa đơn sẽ được cung cấp trong 10 ngày </div>');
             frameDoc.document.write('<div class="bot-text-bill">VAT invoice shall be available tithin 10 days, only if you ask our staff for' +
             ' the issuance TODAY . NO INVOICE shall be issued for the request after the following day of purchase </div>');
             */
            frameDoc.document.write('<div class="bbot-bill">----------------</div>');
            frameDoc.document.write('<div class="bot-name-bill">Phát triển bởi BITS.VN</div>');

            frameDoc.document.close();
            setTimeout(function () {
                window.frames["frame1"].focus();
                window.frames["frame1"].print();
                frame1.remove();
            }, 500);
        }
        //-----------------------------------------
        $scope.qtyfilter = function (service) {
            return (service.qty - service.sell > 0);
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
