'use strict';

angular.module('app').controller('ReturnCtrl', ['$scope','$ngBootbox' ,'$http','socket_url','$stateParams','$timeout','$state','toaster','$filter','$window','$cookieStore','hotkeys',
    function($scope,$ngBootbox,$http ,socket_url,$stateParams,$timeout,$state,toaster ,$filter,$window,$cookieStore,hotkeys) {
        var socket = io.connect(socket_url);

        hotkeys.add({
            combo: 'alt+1',
            allowIn: ['INPUT', 'SELECT', 'DIV'],
            callback: function() {
                $scope.method = !$scope.method ;
            }
        });
        hotkeys.add({
            combo: 'alt+3',
            allowIn: ['INPUT', 'SELECT', 'DIV'],
            callback: function() {
                $("#paid").focus();
            }
        });
        hotkeys.add({
            combo: 'alt+2',
            allowIn: ['INPUT', 'SELECT', 'DIV'],
            callback: function() {
                $("#coupon").focus();
            }
        });
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
        $scope.choose_ck = function(check) {
            $cookieStore.put('check',check._id);
            socket.emit('update-server',{node : 'check'});
            $ngBootbox.hideAll();
        }
        socket.on('update-client-check', function() {
            $scope.check =  $cookieStore.get('check');
            if( $scope.check  !== undefined){
                $http.get('/api/get_checkouts/' + $scope.check )
                    .success(function(data) {
                        $scope.add_bill(data)
                        $cookieStore.remove('check');
                    })
            }
        });
        //-----------
        $scope.$on('$destroy', function (event) {
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
        $scope.pageSize = Math.round(($(window).height()-300)/150)*3 ;
        $(window).resize(function(){
            $scope.pageSize = Math.round(($(window).height()-300)/150)*3 ;
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
        $http.get('/api/server_time/')
            .success(function(data) {
                $scope.date = data ;
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
        //----------------------
        $scope.id_check = Array();
        $scope.code_check = Array();
        $scope.bill_services = Array();
        $scope.bills = Array();
        $scope.date_bill = new Array();
        $scope.coupon = new Array();
        $scope.paid = new Array();
        $scope.total = new Array();
        $scope.check_reduce = new Array();
        $scope.check_paid = new Array();
        $scope.check_user = new Array();
        $scope.total = new Array();
        $scope.dem = 0 ;
        $scope.add_bill = function(check){
            $scope.dem ++ ;
            var id = 'bill_' + new Date().getTime() ;
            $http.get('/api/server_time/')
                .success(function(data) {
                    $scope.date_bill[id] = data ;
                })
            $scope.bills.push({_id : id ,stt : 'Trả Hàng ' +$scope.dem})
            $scope.bill_services[id] = check.services;
            $scope.total[id] = check.total;
            $scope.paid[id] = 0;
            $scope.id_check[id] = check._id;
            $scope.code_check[id] = check.code;
            $scope.check_reduce[id] = check.reduce;
            $scope.check_paid[id] = check.paid;
            $scope.check_user[id] = check.user;
            if(check.coupon){
                $http.get('/api/check_coupon/' + check.coupon)
                    .success(function(data) {
                        $scope.coupon[id] = data;
                    })
            }

            $scope.focus_now = $scope.bills[$scope.bills.length - 1]._id;
            $scope.focus_bill = $scope.bills[$scope.bills.length - 1];
        }
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
            }

        }
        $scope.del_this = function(bill){
            if($scope.bills.length > 1){
                var index = $scope.bills.indexOf(bill);
                $scope.bills.splice(index, 1);
                $scope.focus_now = $scope.bills[$scope.bills.length - 1]._id;
            }else{
                $scope.dem = 0 ;
                var index = $scope.bills.indexOf(bill);
                $scope.bills.splice(index, 1);
            }

        }
        //----------------------------------------

        $scope.customer = {name : "Khách Vãng Lai" , code : 'Guest' , email : 'Không sử dụng' , phone : 'Không sử dụng' , address : 'Không sử dụng'}
        $scope.customer_choose = function(cus){
            $scope.customer = cus ;
        };
        $scope.add_service = function(){
            $scope.bill_services[$scope.focus_now].push({qty : 1 ,_id : 'service_' + new Date().getTime() })

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
        //------------
        $scope.del_service = function(service){
            var index = $scope.bill_services[$scope.focus_now].indexOf(service);
            $scope.bill_services[$scope.focus_now].splice(index, 1);
        }
        $scope.service_push = function(data){
            var not = true ;
            angular.forEach($scope.bill_services[$scope.focus_now], function(service) {
                if(service.code == data.code){
                    service.qty = service.qty +1 ;
                    if(service.qty > service.max){
                        service.qty = service.max ;
                        $ngBootbox.alert(' Sản Phẩm ' +service.name +' Chỉ Còn '+service.max+' Sản Phẩm !!!!')
                    }
                    not = false ;
                }
            })
            if(not){
                $scope.bill_services[$scope.focus_now].push({
                    _id : 'service_' + new Date().getTime(),
                    name : data.name ,
                    code : data.code ,
                    price : data.price ,
                    price_mua : data.price_mua,
                    price_chiphi : data.price_chiphi,
                    sell : data.sell,
                    ncs : data.ncs,
                    max : data.qty - data.sell,
                    nc : null ,
                    qty : 1
                })
            }
        }
        $scope.service_choose = function(service,index){
            var ser = $scope.bill_services[$scope.focus_now][index];
            ser.code = service.code;
            ser.price = service.price;
            ser.price_mua = service.price_mua;
            ser.price_chiphi = service.price_chiphi;
            ser.name = service.name;
            ser.sell = service.sell;
            ser.ncs = service.ncs;
            ser.nc = null ;
            ser.max =service.qty - service.sell;
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
                        sum = sum + service.nc.nc_price*service.qty_tra ;
                    }else{
                        sum = sum + service.price*service.qty_tra ;
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
                        sum_mua = sum_mua +  service.price_mua*service.nc.nc_qty*service.qty_tra ;
                    }else{
                        sum_mua = sum_mua + service.price_mua*service.qty_tra ;
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
                        sum_chiphi = sum_chiphi*1 +  service.price_chiphi*service.nc.nc_qty*service.qty_tra ;
                    }else{
                        sum_chiphi = sum_chiphi*1 +  service.price_chiphi*service.qty_tra ;
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
                            $scope.coupon = data ;
                            toaster.pop('info','Thông Báo !','Cập Nhật Mã Giảm Giá Thành Công');
                        }else{
                            $ngBootbox.alert(' Mã Giảm Giá Hết Hạn !!!!')
                        }
                    }else{
                        $scope.coupon = null ;
                    }
                })
        }

        //---------------------------------------------
        $scope.alert_now = new Date().getTime()
        $scope.check_max = function(service){
            if(service.qty_tra> service.qty){
                service.qty_tra = service.qty ;
            }
            if(service.qty_tra  < 0){
                service.qty_tra =  0 ;
            }
        }
        $scope.status_hide = new Array();
        $scope.save = function( ){
            angular.forEach($scope.bill_services[$scope.focus_now], function(service) {
                $http.post('/api/service_add/',{service : service}) .success(function(data) {
                    socket.emit('update-server',{node : 'service'});
                })
            })
            $scope.status_hide[$scope.focus_now] = true ;
            $http.post('/api/update_checkout/' ,{id : $scope.id_check[$scope.focus_now], key : 'services' , value : $scope.bill_services[$scope.focus_now]})
            $http.post('/api/return/',{bill : {
                code :  $("#code").val() ,
                id_check : $scope.id_check[$scope.focus_now] ,
                code_check : $scope.code_check[$scope.focus_now] ,
                total : $scope.sum($scope.bill_services[$scope.focus_now])  ,
                total_mua : $scope.sum_mua($scope.bill_services[$scope.focus_now])  ,
                total_chiphi : $scope.sum_chiphi($scope.bill_services[$scope.focus_now])  ,
                paid : $scope.paid[$scope.focus_now]  ,
                date : $scope.date_bill[$scope.focus_now]  ,
                coupon : $scope.coupon[$scope.focus_now]?$scope.coupon[$scope.focus_now].code:''  ,
                reduce : $scope.reduce[$scope.focus_now]  ,
                services : $scope.bill_services[$scope.focus_now] ,
                user :  $scope.session_user  ,
                customer :  $scope.customer
            } })
                .success(function(data) {
                    toaster.pop('info','Thông Báo !','Lưu Phiếu Thành Công');
                    socket.emit('update-server',{node : 'return'});
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
            $http.post('/api/logs', {
                active : "Lưu Phiếu Trả Hàng "  + $("#code").val() ,
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
