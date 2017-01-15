'use strict';

angular.module('app').controller('BookRoomManualCtrl', ['$scope','$ngBootbox' ,'$http','socket_url','$stateParams','$timeout','$state','toaster','$filter',
    function($scope,$ngBootbox,$http ,socket_url,$stateParams,$timeout,$state,toaster ,$filter) {
        var socket = io.connect(socket_url);

        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
        });
        socket.on('update-client-company', function() {
            $http.get('/api/companys')
                .success(function(data) {
                    $scope.companys = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        });
        socket.on('update-client-customer', function() {
            $http.get('/api/customers')
                .success(function (data) {
                    $scope.customers = data;
                })
                .error(function (data) {
                    console.log('Error: ' + data);
                });
        })
        //-----------------------
        $scope.rooms = Array() ;
        $http.get('/api/maps/')
            .success(function(data) {
                $scope.date = data ;
                angular.forEach(data, function(map) {
                    angular.forEach(map.room, function(room) {
                        $scope.rooms.push(room);
                    })

                })
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });

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



        $scope.room_choose = function(room ){
            $scope.room = room ;
            $scope.room.type_book = 'hour' ;
            $scope.room.services = Array();
            $scope.room.customs = Array();
            $scope.room.togethers = Array();
        }
        //-------------------------------
        $scope.open = function($event,opened) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope[opened] = true;
        };
        $scope.opened = [] ;
        $scope.open_mod = function($event,opened) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened[opened] = true;
        };
        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            class: 'datepicker'
        };

        $scope.format = 'dd-MM-yyyy';

        $scope.hstep = 1;
        $scope.mstep = 5;

        $scope.ismeridian = true;
        $scope.changed = function(url) {
        }
        $scope.toggleMode = function() {
            $scope.ismeridian = ! $scope.ismeridian;
        };



        //----------------------------------
        $scope.add_service = function(){
            $scope.room.services.push({qty : 1 ,s_id : 'service_' + ($scope.room.services.length + 1 ) })
        }
        $scope.del_service = function(service){
            var index = $scope.room.services.indexOf(service);
            $scope.room.services.splice(index, 1);
        }
        $scope.service_choose = function(service ,service_a){
            service.s_id = service_a.s_id ;
            service.qty = service_a.qty ;
            var index = $scope.room.services.indexOf(service_a);
            $scope.room.services[index] = service;
        }


        //-------------------------------------
        $scope.add_custom = function(){
            $scope.room.customs.push({_id : 'custom' + ($scope.room.customs.length + 1 ) })

        }
        $scope.add_customer = function(){
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                templateUrl: 'tpl/custom/customer/add_customer.html',
                title: 'Thêm Khách Hàng '
            });
        }
        $scope.add_company = function(){
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                templateUrl: 'tpl/custom/company/add_company.html',
                title: 'Thêm Công Ty '
            });
        }
        $scope.del_custom = function(custom){
            var index = $scope.room.customs.indexOf(custom);
            $scope.room.customs.splice(index, 1);
        }

        //-------------------------------------
        $scope.add_together = function(){
            $scope.room.togethers.push({_id : 'together' + ($scope.room.togethers.length + 1 ) })

        }
        $scope.del_together = function(together){
            var index = $scope.room.togethers.indexOf(together);
            $scope.room.togethers.splice(index, 1);
        }
        //-------------------------------------


        $scope.book_room = function(room){
            $http.post('/api/logs', {
                active : "Đặt Phòng Thủ Công "+ room.name ,
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
            room.method =  "Thủ Công" ;
            room.code_room = room.name+"-"+ $filter('date')(room.time_out, 'yyyyMMdd')+"-"+ $filter('date')(room.time_out, 'HHmmss') ;

            $http.post('/api/check_out/',{room : room })
                .success(function(data) {
                        socket.emit('update-server',{node : 'checkout'});
                        $state.go('app.checkout');
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
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
