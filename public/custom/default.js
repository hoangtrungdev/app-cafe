'use strict';

angular.module('app').controller('DefaultCtrl', ['$q','$scope','$ngBootbox' ,'$http','socket_url','$stateParams','$timeout','$state','toaster','$filter','$window','$cookieStore','hotkeys',
    function($q,$scope,$ngBootbox,$http ,socket_url,$stateParams,$timeout,$state,toaster ,$filter,$window,$cookieStore,hotkeys) {
        var socket = io.connect(socket_url);
        document.onkeydown = function(evt) {
            if (evt.keyCode == 112) {  // F1 was pressed
                $("#extra").focus();
                return false ;
            }
            if (evt.keyCode == 113) {  // F2 was pressed
                $("#paid").focus();
                return false ;

            }
        
        }

        //--------------------------
        $scope.data = Array ;
        $scope.open = function($event,abc) {
            $scope.data[abc] = true;
        };

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            class: 'datepicker'
        };

        $scope.format = 'dd-MM-yyyy';

        $scope.actionYeuCauHuy = function(checkout){
            $http.post('/api/update_checkout/' ,{id : checkout._id , key : 'deleted_yeucau' , value : true}) ;
            $http.post('/api/update_checkout/' ,{id : checkout._id , key : 'reason_yeucau' , value : $scope.data.reason}) ;
            $http.post('/api/update_checkout/' ,{id : checkout._id , key : 'user_yeucau' , value :  $scope.session_user  }) ;
            $http.post('/api/update_checkout/' ,{id : checkout._id , key : 'date_yeucau' , value : new Date().getTime()}) ;
            socket.emit('update-server',{node : 'checkout'} ) ;
            $ngBootbox.hideAll();
            toaster.pop('info','Thông Báo !','Yêu Cầu Hủy Hóa Đơn Thành Công');
        }
        $scope.del_checkout_now = function(){
            $scope.checkout_now = false;
        }
        $scope.choose_ck = function(check_out){
            $scope.checkout_now = check_out;
        }
        $scope.tra_hang = function(){
            $scope.method = false;
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                className: 'd-tra d-pop',
                templateUrl: 'tpl/default_tra.html',
                title: 'Yêu Cầu Hủy Hóa Đơn'
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
                .success(function (data) {
                    $scope.checkouts = data;
                })
                .error(function (data) {
                    console.log('Error: ' + data);
                });
        })




        //---------------------------
        $http.get('/api/maps') .success(function(data) {
            $scope.maps = data;
            angular.forEach($scope.maps, function(map,key) {
                if(key == 0 ){
                    $scope.map_focus_now = map._id;
                }
            })
        })
        socket.on('update-client-map', function() {
            $http.get('/api/maps').success(function(data) {
                $scope.maps = data;
            });
        });

        //--------------------------
        $http.get('/api/rooms') .success(function(data) {
            $scope.rooms = data;
            $scope.UpdateScopeTableNow() ;
        })
        socket.on('update-client-room', function() {
            $http.get('/api/rooms').success(function(data) {
                $scope.rooms = data;
                $scope.UpdateScopeTableNow() ;
            });
        });
        //--------------------------
        $http.get('/api/users') .success(function(data) {
            $scope.users = data;
        })
        socket.on('update-client-user', function() {
            $http.get('/api/users').success(function(data) {
                $scope.user = data;
            });
        });
        //--------------------------
        $http.get('/api/staffs') .success(function(data) {
            $scope.staffs = data;
        })
        socket.on('update-client-staff', function() {
            $http.get('/api/staffs').success(function(data) {
                $scope.staff = data;
            });
        });
        //---------------------------
        $scope.set_map_focus = function(id){
            $scope.map_focus_now = id ;
        }
        $scope.actionChooseTable = function(table){
            $scope.show_menu = true;
            if(table.parent){
                table = table.parent ;
            }
            $scope.table_now = table;
            if( !$scope.table_now.extra){
                $scope.actionUpdateRoom(table,'extra', 0) ;
            }
            if( !$scope.table_now.paid){
                $scope.actionUpdateRoom(table,'paid', 0) ;
            }
            if( !$scope.table_now.reduce){
                $scope.actionUpdateRoom(table,'reduce', 0) ;
            }
            if( !$scope.table_now.bill){
                $scope.table_now.bill = new Array();
            }
            socket.emit('update-server',{node : 'room'});
        }
        $scope.UpdateScopeTableNow = function(){
            angular.forEach($scope.rooms, function(room) {
                if($scope.table_now && room._id == $scope.table_now._id){
                    $scope.table_now =  room ;
                }
            })
        }
        $scope.actionClearTableChoose = function(){
            $scope.table_now = '';
            $scope.show_menu = false;

        }
        $scope.actionAddServiceToTable = function(data){
            $scope.tab_show = 'name' ;
            if($scope.table_now.bill == ''){
                $http.post('/api/update_rooms/',{id : $scope.table_now._id , key : 'time' , value :  new Date()})
                data.qty = 1 ;
                $scope.table_now.bill.push(data);
            }else{
                var not = true ;
                angular.forEach($scope.table_now.bill, function(service) {
                    if(service._id == data._id){
                        service.qty = service.qty + 1 ;
                        not = false ;
                    }
                })
                if(not){
                    data.qty = 1 ;
                    $scope.table_now.bill.push(data);
                }
            }
            $http.post('/api/update_rooms/',{id : $scope.table_now._id , key : 'bill' , value :  $scope.table_now.bill}).success(function(data) {
                socket.emit('update-server',{node : 'room'});
            })
        }
        $scope.actionChangeQty = function (room){
            $http.post('/api/update_rooms/',{id : room._id , key : 'bill' , value :  room.bill})
        }
        $scope.actionChangeNote = function (room){
            $http.post('/api/update_rooms/',{id : room._id , key : 'note' , value :  room.note})
        }
        $scope.actionChangeStatusServiceInTable = function(data){
            angular.forEach($scope.table_now.bill, function(service) {
                if(service._id == data._id){
                    service.status = !service.status;
                }
            })
            $http.post('/api/update_rooms/', {  id: $scope.table_now._id,key: 'bill',value: $scope.table_now.bill}).success(function (data) {
                socket.emit('update-server', {node: 'room'});
            })

        }
        $scope.actionGhepBan = function (room_c,room) {
            room.join_array.push(room_c)
            $http.post('/api/update_rooms/',{id : room_c._id , key : 'parent' , value :  room})
            $http.post('/api/update_rooms/',{id : room._id , key : 'join_array' , value :  room.join_array}).success(function () {
                socket.emit('update-server', {node: 'room'});
            })
        }
        $scope.actionDeleteJoin = function(index ,room_join,room){
            room.join_array.splice(index, 1);
            $http.post('/api/update_rooms/',{id : room_join._id , key : 'parent' , value :  ''})
            $http.post('/api/update_rooms/',{id : room._id , key : 'join_array' , value :  room.join_array}).success(function () {
                socket.emit('update-server', {node: 'room'});
            })

        }
        $scope.actionDeleteServiceInTable = function(index){
            $scope.table_now.bill.splice(index, 1);
            $http.post('/api/update_rooms/',{id : $scope.table_now._id , key : 'bill' , value :  $scope.table_now.bill}).success(function(data) {
                socket.emit('update-server',{node : 'room'});
            });

        }
        $scope.actionUpdateRoom = function (data , key , value) {
            $http.post('/api/update_rooms/',{id : data._id , key :  key  , value :  value}).success(function(data) {
                // socket.emit('update-server',{node : 'room'});
            })
        }



        $scope.actionUpdateSocket = function (room) {
            $http.post('/api/update_rooms/',{id : room._id , key : 'bill' , value :  room.bill}).success(function(data) {
                socket.emit('update-server',{node : 'room'});
                toaster.pop('info','Thông Báo !','Cập Nhật Thành Công');
            })
        }
        $scope.actionSum = function(object){
            var sum = 0 ;
            angular.forEach(object, function(service) {
                if(service.price){
                    sum = sum + service.price*service.qty ;
                }
            })
            return sum ;
        }
        $scope.getValueCoupon = function(room){
            var ret = 0;
            if(room.coupon){
                if(room.coupon._id){
                    if(room.coupon.type=='percent'){
                        ret =  room.coupon.value/100*($scope.actionSum(room.bill) ) ;
                    }else{
                        ret = room.coupon.value ;
                    }
                }
            }
            return ret ;
        }
        $scope.getClassRoom = function(room){
            var done = true ;
            if(room.bill != ''){
                angular.forEach(room.bill, function(service) {
                    if(service.status != false){
                        done = false ;
                    }
                })
                if(done){
                    return 'table-done';
                }else{
                    return 'table-wait';
                }
            }else{
                if(room.status){
                    return 'table-book';
                }else {
                    return '';
                }
            }
        }
        $scope.actionChooseRoomCustomer = function (room) {
            $http.post('/api/update_rooms/',{id : room._id , key : 'customer' , value :  room.customer})
        }
        $scope.actionChooseRoomUser = function (room) {
            $http.post('/api/update_rooms/',{id : room._id , key : 'user' , value :  room.user})
        }
        $scope.actionBookTable = function (room) {
            $http.post('/api/update_rooms/',{id : room._id , key : 'status' , value :  true}).success(function (data) {
                socket.emit('update-server', {node: 'room'});
            })
        }
        $scope.actionDelBookTable = function (room) {
            $http.post('/api/update_rooms/',{id : room._id , key : 'status' , value :  false}).success(function (data) {
                socket.emit('update-server', {node: 'room'});
            })
        }
        $http.get('/api/checkouts')
            .success(function(data) {
                $scope.checkouts = data;
            })
        socket.on('update-client-checkout', function() {
            $http.get('/api/checkouts')
                .success(function(data) {
                    $scope.checkouts = data;
                })
        });
        $scope.open_room = function(room) {
            room.open = true;
        };

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            class: 'datepicker'
        };

        $scope.format = 'dd-MM-yyyy';
        $scope.currentPage_ck = 1;
        $scope.pageSize_ck = 10 ;
        $scope.pageChanged_ck = function(currentPage) {
            $scope.currentPage_ck = currentPage;
        }
        //-----------
        $http.get('/api/services')
            .success(function(data) {
                $scope.services = data;
            })
        //---------------------------
        $http.get('/api/categorys')
            .success(function(data) {
                $scope.categorys = data;
            })
        // pagination ----------------------------------
        $scope.tab_show = 'name';
        $scope.set_scope = function(key,value){
            $scope[key] = value ;
        }

        $scope.currentPage = 1;
        $scope.pageSize = Math.round(($('#d-menu-bg').width()-30)/133)*2 ;
        $('#d-menu-in').width($scope.pageSize*133/2)
        $(window).resize(function(){
            $scope.pageSize = Math.round(($('#d-menu-bg').width()-30)/133)*2 ;
            $('#d-menu-in').width($scope.pageSize*133/2 )
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
        };
        $scope.config = {} ;
        $http.get('/api/globals')
            .success(function(data) {
                angular.forEach(data, function(config) {
                    $scope.config[config.key] = config.value ;
                })
            })

        //-------------------------
        $scope.date = new Date().getTime() ;

        $http.get('/api/customers')
            .success(function(data) {
                $scope.customers = data;
            })
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

        socket.on('update-client-service', function() {
            $http.get('/api/services')
                .success(function(data) {
                    $scope.services = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        });





        //----------
        $scope.check_coupon = function(room){
            $http.get('/api/check_coupon/' + room.coupon.code)
                .success(function(data) {
                    if(data != null){
                        if(data.start < new Date().getTime() && data.end > new Date().getTime()){
                            $http.post('/api/update_rooms/',{id : room._id , key : 'coupon' , value :  data});
                            room.coupon = data ;
                            $ngBootbox.alert(' Cập Nhật Mã Giảm Giá Thành Công !!!!')
                        }else{
                            $ngBootbox.alert(' Mã Giảm Giá Hết Hạn !!!!')
                            $http.post('/api/update_rooms/',{id : room._id , key : 'coupon' , value :  ''}).success(function (data) {
                                room.coupon = ''
                            })
                        }
                    }else{
                        $ngBootbox.alert(' Mã Giảm Giá Không Chính Xác !!!!')
                        $http.post('/api/update_rooms/',{id : room._id , key : 'coupon' , value :  ''}).success(function (data) {
                            room.coupon = ''
                        })
                    }
                })
        }


        $scope.reset = function( ){
            $window.location.reload();
        }
        $scope.actionSaveBill = function(room){
            if(room.print){
                $scope.printDiv('print-div') ;
            }
            $http.post('/api/check_out/',{bill : {
                    code :  $("#code").val() ,
                    total : $scope.actionSum(room.bill)  ,
                    paid :  room.paid  ,
                    date :   new Date(room.time).getTime()  ,
                    extra :  room.extra  ,
                    reduce : room.reduce  ,
                    reduce_coupon : $scope.getValueCoupon(room)  ,
                    note : room.note  ,
                    vat : room.vat  ,
                    services : room.bill  ,
                    join_array : room.join_array  ,
                    user_add :  $scope.session_user  ,
                    customer :  room.customer,
                    user :  room.user
                } })
                .success(function(data) {
                    toaster.pop('info','Thông Báo !','Lưu Phiếu Thành Công');
                    socket.emit('update-server',{node : 'checkout'});
                    $http.post('/api/update_rooms/',{id : room._id , key :  'paid'  , value :  0})
                    $http.post('/api/update_rooms/',{id : room._id , key :  'extra'  , value :  0})
                    $http.post('/api/update_rooms/',{id : room._id , key :  'reduce'  , value :  0})
                    $http.post('/api/update_rooms/',{id : room._id , key :  'time'  , value :  ''})
                    $http.post('/api/update_rooms/',{id : room._id , key :  'note'  , value :  ''})
                    $http.post('/api/update_rooms/',{id : room._id , key :  'bill'  , value :  []})
                    $http.post('/api/update_rooms/',{id : room._id , key :  'user'  , value :  ''})
                    $http.post('/api/update_rooms/',{id : room._id , key :  'coupon'  , value :  ''})
                    $http.post('/api/update_rooms/',{id : room._id , key :  'customer'  , value :  ''})
                    $http.post('/api/update_rooms/',{id : room._id , key :  'status'  , value :  false})
                    $http.post('/api/update_rooms/',{id : room._id , key :  'vat'  , value :  false})
                    $http.post('/api/update_rooms/',{id : room._id , key :  'join_array'  , value :  []})
                    angular.forEach(room.join_array, function(room_join) {
                        $http.post('/api/update_rooms/',{id : room_join._id , key :  'parent'  , value :  ''})
                    })

                    socket.emit('update-server',{node : 'room'});

                })
        }
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
            $http.post('/api/check_out/',{bill : {
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
                    socket.emit('update-server',{node : 'checkout'});
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
            frameDoc.document.write('<html><head><title>In Hóa Đơn</title>');
            frameDoc.document.write('</head><body>');
            //Append the external CSS file.
            frameDoc.document.write('<link href="css/print.css" rel="stylesheet" type="text/css" />');
            frameDoc.document.write('<div id="title-bill">'+$scope.config.name+'</div>');
            frameDoc.document.write('<div class="dive-bill">-------------o0o-------------</div>');
            frameDoc.document.write('<div class="info-bill">'+$scope.config.address+'</div>');
            frameDoc.document.write('<div class="info-bill">Điện thoại : '+$scope.config.phone+'</div>');
            frameDoc.document.write('<div class="info-bill">Email : '+$scope.config.email+'</div>');
            // frameDoc.document.write('<div class="info-bill-mod">'+ $("#code").val()+'</div>');
            frameDoc.document.write('<div class="dive-bill">---------------------------------------</div>');

            frameDoc.document.write(contents);
            frameDoc.document.write('<div class="info-bill">Pass Wifi : '+$scope.config.wifi+' </div>');
            frameDoc.document.write('<div class="bbot-bill">-------------------------------------------------------</div>');
            frameDoc.document.write('<div class="bot-thanks-bill">Xin cảm ơn Quý Khách  !</div>');
            frameDoc.document.write('<div class="bot-thanks-bill">Thu ngân : '+$scope.session_user.name+'</div>');

            frameDoc.document.write('<div class="bot-date-bill">Ngày :'+$filter('date')( $scope.date , 'dd/MM/yyyy')+' Giờ '+
                $filter('date')($scope.date, 'HH:mm')+' </div>');
            /*
             frameDoc.document.write('<div class="bot-text-bill">Hóa Đơn bán hàng chỉ có giá trị khi quý khách yêu cầu xuất hóa dơn GTGT trong ngày. ' +
             'Hóa đơn sẽ được cung cấp trong 10 ngày </div>');
             frameDoc.document.write('<div class="bot-text-bill">VAT invoice shall be available tithin 10 days, only if you ask our staff for' +
             ' the issuance TODAY . NO INVOICE shall be issued for the request after the following day of purchase </div>');
             */
            frameDoc.document.write('<div class="bbot-bill">----------------</div>');
            frameDoc.document.write('<div class="bot-name-bill">Hệ thống được cung cấp bởi BOPS.VN</div>');

            frameDoc.document.close();
            setTimeout(function () {
                window.frames["frame1"].focus();
                window.frames["frame1"].print();
                frame1.remove();
            }, 500);
        }
        //-----------------------------------------
        $scope.show_tb = function () {
            $('#tablet-detail').animate({left: '0px'});
        }
        $scope.hide_tb = function () {
            $('#tablet-detail').animate({left: '100%'});

        }
        $scope.qtyfilter = function (service) {
            return (service.qty - service.sell > 0);
        }
        //----------------------------
        $scope.$on(Keypad.MODIFIER_KEY_PRESSED, function(event,key,id){
            switch(key){
                case "CLOSE":
                    $scope.close();
                    break;
            }
        });

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
