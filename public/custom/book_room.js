'use strict';

angular.module('app').controller('BookRoomCtrl', ['$scope','$ngBootbox' ,'$http','socket_url','$stateParams','$timeout','$state','toaster','$filter','$cookieStore',
    function($scope,$ngBootbox,$http ,socket_url,$stateParams,$timeout,$state,toaster ,$filter,$cookieStore) {
        var socket = io.connect(socket_url);

        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
        });

        //-----------------------
        $scope.array_room_post = $stateParams.array_room ;
        $scope.array_room = $stateParams.array_room.split(',') ;
        $scope.type_page = $stateParams.type_page;
        $scope.array_room_detail = new Array();
        $scope.type = [] ;
        $scope.Math = window.Math ;
        $http.get('/api/server_time/')
            .success(function(data) {
                $scope.date = data ;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });

        $scope.check_status = true ;
        angular.forEach($scope.array_room, function(url) {
            var param = url.split('|room|') ;
            $http.post('/api/array_room_detail/',{floor_id : param[0] ,room_id : param[1] })
                .success(function(data) {
                    $http.get('/api/server_time/')
                        .success(function(time) {
                            data.time_out = time;
                            $scope.array_room_detail.push(data);
                            if(data.customer == undefined || data.customer == ''){
                                $scope.check_status = false ;
                            }
                        })
                        .error(function(data) {
                            console.log('Error: ' + data);
                        });

                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        })

        socket.on('update-client-company', function() {
            $http.get('/api/companys')
                .success(function(data) {
                    $scope.companys = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
            angular.forEach($scope.array_room_detail, function(room , key) {
                $http.post('/api/array_room_detail/',{floor_id : room.map_id ,room_id : room._id })
                    .success(function(data) {
                        $scope.array_room_detail[key].company = data.company ;

                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
            })
        });
        socket.on('update-client-service', function() {
            angular.forEach($scope.array_room_detail, function(room , key) {
                $http.post('/api/array_room_detail/',{floor_id : room.map_id ,room_id : room._id })
                    .success(function(data) {
                        $scope.array_room_detail[key].services = data.services ;
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
            })
        });
        socket.on('update-client-custom', function() {
            angular.forEach($scope.array_room_detail, function(room , key) {
                $http.post('/api/array_room_detail/',{floor_id : room.map_id ,room_id : room._id })
                    .success(function(data) {
                        $scope.array_room_detail[key].customs = data.customs ;
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
            })
        });
        socket.on('update-client-together', function() {
            angular.forEach($scope.array_room_detail, function(room , key) {
                $http.post('/api/array_room_detail/',{floor_id : room.map_id ,room_id : room._id })
                    .success(function(data) {
                        $scope.array_room_detail[key].togethers = data.togethers ;
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
            })
        });
        socket.on('update-client-customer', function() {
            $http.get('/api/customers')
                .success(function(data) {
                    $scope.customers = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
            $scope.check_status = true ;
            angular.forEach($scope.array_room_detail, function(room , key) {
                $http.post('/api/array_room_detail/',{floor_id : room.map_id ,room_id : room._id })
                    .success(function(data) {
                        $scope.array_room_detail[key].customer = data.customer ;
                        if(data.customer == undefined){
                            $scope.check_status = false ;
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
            })
        });

        $http.get('/api/services')
            .success(function(data) {
                $scope.services = data;
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
        $http.get('/api/companys')
            .success(function(data) {
                $scope.companys = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        $http.get('/api/customers')
            .success(function(data) {
                $scope.customers = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });





        //----------------------------------
        $scope.add_service = function(room){
            $http.post('/api/book_add_service/',{room_id : room._id })
                .success(function(data) {
                    socket.emit('update-server',{node : 'service'});
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }
        $scope.del_service = function(room ,service_id){
            $http.post('/api/book_del_service/',{room_id : room._id ,service_id : service_id })
                .success(function(data) {
                    socket.emit('update-server',{node : 'service'});
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }
        $scope.service_choose = function(service ,room ){
            $http.post('/api/book_choose_service/',{room_id : room._id ,service_id : service._id , s_id :service.s_id })
                .success(function(data) {
                    socket.emit('update-server',{node : 'service'});
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }
        $scope.edit_service = function(service ,room ){
            $http.post('/api/book_edit_service/',{room_id : room._id ,service : service })
                .success(function(data) {
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }
        $scope.customer_choose = function( room ){
            $http.post('/api/book_choose_customer/',{room_id : room._id ,customer : room.customer  })
                .success(function(data) {
                    socket.emit('update-server',{node : 'customer'});
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }
        $scope.supplier_choose = function( room ){
            $http.post('/api/book_choose_supplier/',{room_id : room._id ,supplier : room.supplier  })
                .success(function(data) {

                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }
        //-------------------------------------
        $scope.add_custom = function(room){
            $http.post('/api/book_add_custom/',{room_id : room._id })
                .success(function(data) {
                    socket.emit('update-server',{node : 'custom'});
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }
        $scope.del_custom = function(room ,custom_id){
            $http.post('/api/book_del_custom/',{room_id : room._id ,custom_id : custom_id })
                .success(function(data) {
                    socket.emit('update-server',{node : 'custom'});
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }
        $scope.edit_custom = function(custom ,room ){
            $http.post('/api/book_edit_custom/',{room_id : room._id ,custom : custom })
                .success(function(data) {
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }
        //-------------------------------------
        $scope.add_together = function(room){
            $http.post('/api/book_add_together/',{room_id : room._id })
                .success(function(data) {
                    socket.emit('update-server',{node : 'together'});
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }
        $scope.del_together = function(room ,together_id){
            $http.post('/api/book_del_together/',{room_id : room._id ,together_id : together_id })
                .success(function(data) {
                    socket.emit('update-server',{node : 'together'});
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }
        $scope.edit_together = function(together ,room ){
            $http.post('/api/book_edit_together/',{room_id : room._id ,together : together })
                .success(function(data) {
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }
        //-------------------------------------


        $scope.book_room = function(type){
            var dem = 0 ;
            angular.forEach($scope.array_room_detail, function(room,key) {

                if(type == 'add'){
                    $http.post('/api/logs', {
                        active : "Đặt Phòng "+ room.name + ". Khách đặt phòng : " + room.customer.name,
                        time : new Date().getTime(),
                        type : 'info',
                        user : $scope.session_user.name
                    }) .success(function(data) {
                        socket.emit('update-server',{node : 'log'});
                    })
                }else if(type == 'edit'){
                    $http.post('/api/logs', {
                        active : "Cập Nhật Phòng "+ room.name,
                        time : new Date().getTime(),
                        type : 'info',
                        user : $scope.session_user.name
                    }) .success(function(data) {
                        socket.emit('update-server',{node : 'log'});
                    })
                }
                else if(type=='edit_check_out'){

                }

                $http.post('/api/book_room/',{floor_id : room.map_id ,room_id : room._id , type_book : $("#type"+room._id).val() ,
                    time : (type == 'add')?$scope.date:'none-edit' })
                    .success(function(data) {
                        dem = dem + 1 ;
                        if(dem == $scope.array_room_detail.length){
                            if(type == 'add'){
                                $state.go('app.map').then(function() {
                                    $scope = $scope.$new(true);
                                    toaster.pop('info','Thông Báo !','Đặt Phòng Thành Công');
                                    socket.emit('update-server',{node : 'map'});
                                });
                            }else if(type == 'edit'){
                                $state.go('app.map').then(function() {
                                    $scope = $scope.$new(true);
                                    toaster.pop('info','Thông Báo !','Cập Nhật Thành Công');
                                    socket.emit('update-server',{node : 'map'});

                                });
                            }
                            else if(type=='edit_check_out'){
                                $state.go('app.check_out',{array_room: $scope.array_room_post});
                            }
                        }

                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
            })
        }
        $scope.check_out = function(){
            var dem = 0
            angular.forEach($scope.array_room_detail, function(room) {
                $http.post('/api/logs', {
                    active : "Thanh Toán Phòng "+ room.name ,
                    time : new Date().getTime(),
                    type : 'info',
                    user : $scope.session_user.name
                }) .success(function(data) {
                    socket.emit('update-server',{node : 'log'});
                })
                room.room_id = room["_id"] ;
                delete room["_id"];
                room.all = $scope.total_price(room.time,room.time_out,room.type_book,room.room_type,'payment') ;
                room.all_services = $scope.sum_service(room.services) ;
                room.all_customs = $scope.sum_custom(room.customs) ;
                room.reduce = 0 ;
                room.total = room.all - room.reduce + room.all_services + room.all_customs ;
                room.user =  $scope.session_user ;
                room.method =  "Tự Động" ;
                room.code_room = room.name+"-"+ $filter('date')(room.time_out, 'yyyyMMdd')+"-"+ $filter('date')(room.time_out, 'HHmmss') ;

                $http.post('/api/check_out/',{room : room })
                    .success(function(data) {
                        dem = dem + 1 ;
                        if(dem == $scope.array_room_detail.length) {
                            if($scope.array_room_detail.length != 1){
                               // $scope.printDiv('print');
                            }else{
                                $cookieStore.put('print', room.code_room);
                            }
                            socket.emit('update-server',{node : 'checkout'});
                            $state.go('app.checkout');
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
            })


        }
        //-----------------------
        $scope.add_company = function(room){
            $scope.room_post =  room;
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                templateUrl: 'tpl/custom/company/add_company.html',
                title: 'Thêm Công Ty'
            });
        }
        $scope.add_customer = function(room){
            $scope.room_post =  room;
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                templateUrl: 'tpl/custom/customer/add_customer.html',
                title: 'Thêm Khách Hàng '
            });
        }


        // ---------print----------
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
            frameDoc.document.write(contents);
            frameDoc.document.close();
            setTimeout(function () {
                window.frames["frame1"].focus();
                window.frames["frame1"].print();
                frame1.remove();
            }, 500);
        }

        //---function---
        $scope.get_hour_mod = function(time_in,time_out,type){
            var miliseconds = time_out - time_in ;
            var seconds = Math.floor(miliseconds / 1000);
            var days = Math.floor(seconds / 86400);
            var hours = Math.floor((seconds % 86400) / 3600);
            var minutes = Math.floor(((seconds % 86400) % 3600) / 60);
            var s = Math.floor(seconds - minutes*60 - hours*3600 - days*86400 );
            var timeString = '';
            if(type == 'd') timeString += (days + " d ");
            if(type == 'h') timeString += (hours + " h ");
            if(type == 'm') timeString +=  (minutes + " m ");
            return timeString;
        }
        $scope.get_hour = function(time_in,time_out){
            var miliseconds = time_out - time_in ;
            var seconds = Math.floor(miliseconds / 1000);
            var days = Math.floor(seconds / 86400);
            var hours = Math.floor((seconds % 86400) / 3600);
            var minutes = Math.floor(((seconds % 86400) % 3600) / 60);
            var s = Math.floor(seconds - minutes*60 - hours*3600 - days*86400 );
            var timeString = '';
            if(days > 0) timeString += (days + " ngày ");
            if(hours > 0) timeString += (hours + " giờ ");
            if(minutes > 0) timeString +=  (minutes + " phút ");
            if(s >= 0) timeString +=  (s + " giây ");
            return timeString;
        }
        $scope.dateArray = function getDates( d1, d2 ){
            var oneDay = 24*3600*1000;
            for (var d=[],ms=d1*1,last=d2*1;ms<last;ms+=oneDay){
                d.push( new Date(ms).getTime() );
            }
            return  d;
        }
        $scope.get_hour_by_day = function(time_in,time_out){
            var miliseconds = time_out - time_in ;
            var seconds = Math.floor(miliseconds / 1000);
            var days = Math.floor(seconds / 86400);
            var hours = Math.floor((seconds % 86400) / 3600);
            var minutes = Math.floor(((seconds % 86400) % 3600) / 60);
            var s = Math.floor(seconds - minutes*60 - hours*3600 - days*86400 );
            var timeString = '';
            if(days >= 1){
                timeString += (24 + " giờ ");
            }else{
                if(hours > 0) timeString += (hours + " giờ ");
                if(minutes > 0) timeString +=  (minutes + " phút ");
                if(s >= 0) timeString +=  (s + " giây ");
            }

            return timeString;
        }
        $scope.get_type_day =  function(time_in){
            var param = "Ngày Thường";
            return param;
        }
        $scope.price_by_day = function(time_in,time_in_real,time_out,type_book,room_type,mod){
            var miliseconds = time_out - time_in ;
            var seconds = Math.floor(miliseconds / 1000);
            var price_room = 0;

            if(type_book=='day'){
                price_room = room_type.day;
                if(time_out-time_in_real <24*60*60*1000){
                    return price_room;
                }else{
                    if(seconds >= 24*60*60){
                        return price_room;
                    }else{
                        if(seconds >= 12*60*60){
                            return price_room;
                        }else{
                            if(seconds >= 6*60*60){
                                return price_room*0.5;
                            }else{
                                if(mod=='real'){
                                    return Math.ceil(seconds/(60*60)*room_type.day_odd);
                                }else{
                                    return Math.ceil(seconds/(60*60))*room_type.day_odd;
                                }
                            }
                        }

                    }
                }

            }else if(type_book=='night'){
                price_room = room_type.night;
                if(seconds >= 86400){
                    return price_room;
                }else{
                    if(mod=='real'){
                        return Math.round(seconds/86400*price_room);
                    }else{
                        return price_room;
                    }
                }
            }
            else{
                if(mod=='real'){
                    if(seconds < 60*60){
                        return Math.ceil(seconds/3600*room_type.hour)
                    }else if(seconds < 2*60*60){
                        if(seconds < (60*60+ 15*60)){
                            return room_type.hour*1 + Math.ceil((seconds-60*60)/3600*room_type.hour_under1);
                        }else if(seconds < (60*60+ 30*60)){
                            return room_type.hour*1 + Math.ceil((seconds-60*60)/3600*room_type.hour_under2);
                        }else{
                            return room_type.hour*1 + Math.ceil((seconds-60*60)/3600*room_type.hour_under3);
                        }
                    }else if(seconds < 3*60*60){
                        return room_type.hour*1 + room_type.hour1*1 + Math.ceil((seconds-2*60*60)/3600*room_type.hour2);
                    }else{
                        return room_type.hour*1 + room_type.hour1*1 + room_type.hour2*1 + Math.ceil((seconds-3*60*60)/3600*room_type.hour3);
                    }
                }else{
                    if(seconds < 60*60){
                        return room_type.hour*1;
                    }else if(seconds < 2*60*60){
                        if(seconds < (60*60+ 15*60)){
                            return room_type.hour*1 + room_type.hour_under1*1;
                        }else if(seconds < (60*60+ 30*60)){
                            return room_type.hour*1 + room_type.hour_under2*1;
                        }else{
                            return room_type.hour*1 + room_type.hour_under3*1;
                        }
                    }else if(seconds < 3*60*60){
                        return room_type.hour*1 + room_type.hour1*1 + Math.ceil((seconds-2*60*60)/3600)*room_type.hour2;
                    }else{
                        return room_type.hour*1 + room_type.hour1*1 + room_type.hour2*1 + Math.ceil((seconds-3*60*60)/3600)*room_type.hour3;
                    }
                }
            }

        }

        $scope.sum_service = function(object){
            var sum = 0 ;
            angular.forEach(object, function(service) {
                if(service.price){
                    sum = sum + service.price*service.qty ;
                }
            })
            return sum ;
        }
        $scope.sum_custom = function(object){
            var sum = 0 ;
            angular.forEach(object, function(custom) {
                if( custom.custom_value){
                    sum = sum + custom.custom_value*1 ;
                }
            })
            return sum ;
        }
        $scope.total_price = function(time_in,time_out,type_book,room_type,mod){
            var dateArray = $scope.dateArray(time_in , time_out) ;
            var total =  0 ;
            angular.forEach(dateArray, function(date) {
                total = total + $scope.price_by_day(date,time_in ,time_out,type_book,room_type,mod)*1;
            })
            return total;
        }
        $scope.reduce_price = function(type,value,total){
            var reduce = 0;
            if(type == 'percent'){
                reduce = total*value/100;
            }else if(type == 'value'){
                reduce = value ;
            }
            return reduce ;
        }

    }
]);
