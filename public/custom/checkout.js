'use strict';

angular.module('app').controller('CheckoutCtrl', ['$scope','$ngBootbox' ,'$http','socket_url','$stateParams','$timeout','$state','toaster','$filter','$cookieStore',
    function($scope,$ngBootbox,$http ,socket_url,$stateParams,$timeout,$state,toaster,$filter,$cookieStore ) {
        var socket = io.connect(socket_url);
        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
        });
        if($stateParams.code){
            $scope.code_now =  $stateParams.code;
            $scope.edit_checkout_id = $stateParams.code ;
        }
        if($cookieStore.get('print')){
            $scope.is_print = true ;
            $scope.print_id = $cookieStore.get('print') ;
            $cookieStore.remove('print')
        }
        $scope.del_mod = function(checkout){
            $scope.checkout_now =  checkout;
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                className: 'ser-pop',
                templateUrl: 'tpl/custom/checkout/del_mod.html',
                title: 'Xóa Hóa Đơn'
            });
        }
        $scope.actionSet = function(){
            if(!$scope.filter_deleted_yeucau){
                $scope.filter_deleted_yeucau = true ;
            }else{
                delete  $scope.filter_deleted_yeucau;
            }
        }
        $scope.actionRestore = function(checkout){
            $http.post('/api/update_checkout/' ,{id : checkout._id , key : 'deleted' , value : false}) ;
            $http.post('/api/update_checkout/' ,{id : checkout._id , key : 'reason' , value : ''}) ;
            socket.emit('update-server',{node : 'checkout'} ) ;
            $ngBootbox.hideAll();
        }
        $scope.actionNotDel = function(checkout){
            $http.post('/api/update_checkout/' ,{id : checkout._id , key : 'deleted_yeucau' , value : false}) ;
            $http.post('/api/update_checkout/' ,{id : checkout._id , key : 'reason_yeucau' , value : ''}) ;
            socket.emit('update-server',{node : 'checkout'} ) ;
        }
        $scope.actionDelMod = function(checkout){
                $http.post('/api/update_checkout/' ,{id : checkout._id , key : 'deleted' , value : true}) ;
                $http.post('/api/update_checkout/' ,{id : checkout._id , key : 'deleted_yeucau' , value : false}) ;
                $http.post('/api/update_checkout/' ,{id : checkout._id , key : 'reason' , value : $scope.data.reason}) ;
                socket.emit('update-server',{node : 'checkout'} ) ;
                $ngBootbox.hideAll();
        }


        $scope.detail_click_mod = function(data){
            setTimeout(function () {
                $scope.data_detail =  data;
                $scope.is_print = false ;
                $ngBootbox.customDialog({
                    scope : $scope,
                    backdrop: true,
                    className: 'class-full',
                    templateUrl: 'tpl/custom/checkout/detail.html',
                    title: 'Chi Tiết Thanh Toán'
                })
            },500);
        }
        $scope.total_mua = {};
        $scope.total_chiphi = {};
        $scope.get_total_again = function(checkout){
            $scope.total_mua[checkout._id] = 0 ;
            $scope.total_chiphi[checkout._id] = 0 ;
            angular.forEach(checkout.services, function(service) {
                $http.get('/api/check_service/' + service.code)
                    .success(function(data) {
                        if(data != null &&  data.price_mua != null){
                            if(service.nc){
                                $scope.total_mua[checkout._id] = $scope.total_mua[checkout._id] +  data.price_mua*service.nc.nc_qty*service.qty ;
                                $scope.total_chiphi[checkout._id] = $scope.total_chiphi[checkout._id] +  data.price_chiphi*service.nc.nc_qty*service.qty ;
                            }else{
                                $scope.total_mua[checkout._id] = $scope.total_mua[checkout._id] + data.price_mua*service.qty ;
                                $scope.total_chiphi[checkout._id] = $scope.total_chiphi[checkout._id] + data.price_chiphi*service.qty ;
                            }

                        }
                    })
            })
            setTimeout(function(){
                $http.post('/api/update_checkouts/' ,{ _id : checkout._id,total_mua :  $scope.total_mua[checkout._id] ,total_chiphi :  $scope.total_chiphi[checkout._id]})
                    .success(function(data) {
                        //  socket.emit('update-server');
                    })
            },5000)
        }
        $scope.printDivMod = function(divName) {
            setTimeout(function () {
                var contents = $("#"+divName).html();
                var id_payment =  $("#id-payment").val();
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
                //Append the DIV contents.
                frameDoc.document.write(contents);
                frameDoc.document.write('</body></html>');
                frameDoc.document.close();
                setTimeout(function () {
                    window.frames["frame1"].focus();
                    window.frames["frame1"].print();
                    frame1.remove();
                }, 500);
            }, 1000);

        }

//-----------------------
        $http.get('/api/returns')
            .success(function(data) {
                $scope.returns = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        socket.on('update-client-return', function() {
            $http.get('/api/returns')
                .success(function(data) {
                    $scope.returns = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        });


        $scope.array_room_post = $stateParams.array_room ;
        $scope.array_room_detail = new Array();
        $scope.type = [] ;
        $scope.Math = window.Math ;


        socket.on('update-client-checkout', function() {
            $http.get('/api/checkouts')
                .success(function(data) {
                    $scope.checkouts = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        });

        $http.get('/api/server_time/')
            .success(function(data) {
                $scope.date = data ;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        $http.get('/api/companys/')
            .success(function(data) {
                $scope.companys = data ;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
//-------------
        $scope.set_scope = function(key,value){
            $scope[key] = value ;
        }
//-------------
        $scope.del = function(checkout) {
            angular.forEach(checkout.services, function(service) {
                $http.post('/api/service_add_del/',{service : service}) .success(function(data) {
                    socket.emit('update-server',{node : 'service'});
                })
            })
            $http.post('/api/logs', {
                active : "Xóa 1 Phiếu Bán Hàng ( Tổng Thanh Toán : "+ $filter('number')(checkout.total ,0) +" )",
                time : new Date().getTime(),
                type : 'warning',
                user : $scope.session_user.name
            }) .success(function(data) {
                socket.emit('update-server',{node : 'log'});
            })
            $http.delete('/api/checkouts/' + checkout._id)
                .success(function(data) {
                    socket.emit('update-server',{node : 'checkout'});

                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        $http.get('/api/maps')
            .success(function(data) {
                $scope.rooms = Array();
                angular.forEach(data, function(map) {
                    angular.forEach(map.room, function(room) {
                        $scope.rooms.push(room);
                    })
                })
            })
            .error(function(data) {
                console.log('Error: ' + data);
            })
        $http.get('/api/checkouts')
            .success(function(data) {
                $scope.checkouts = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            })
        $http.get('/api/users')
            .success(function(data) {
                $scope.users = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            })


        $http.get('/api/services')
            .success(function(data) {
                $scope.services = data;
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

//-------------------------------------
        $scope.detail_click = function(data){
            $scope.data_detail =  data;
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                className: 'class-full',
                templateUrl: 'tpl/custom/checkout/detail.html',
                title: 'Chi Tiết Phiếu Bán Hàng'
            });
        }
        $scope.edit_checkout = function(id){
            $scope.edit_ser = false ;
            if( $scope.edit_checkout_id == null){
                $scope.edit_checkout_id = id;
            }else{
                if($scope.edit_checkout_id != id){
                    $scope.edit_checkout_id = id;
                }else if($scope.edit_checkout_id != null){
                    $scope.edit_checkout_id = null;
                }
            }
        };

//---------------------------------
        $scope.data_show = 2 ;
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

// ---------print----------
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


        $scope.currentPage = 1;
        if($(window).width() <= 1024 ){
            var reduce_size = 400 ;
            $scope.tablet_hide = true ;
        }else{
            var reduce_size = 480 ;
            $scope.tablet_hide = false ;

        }
        var min_size = 7 ;
        var height = 37 ;
        if(Math.round(($(window).height()-reduce_size)/height) > min_size){
            $scope.pageSize = Math.round(($(window).height()-reduce_size)/height) ;
        }else{
            $scope.pageSize = min_size ;
        }
        $(window).resize(function(){
            if($(window).width() <= 1024 ){
                var reduce_size = 400 ;
                $scope.tablet_hide = true ;
            }else{
                var reduce_size = 480 ;
                $scope.tablet_hide = false ;

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


    }
]);

angular.module("app")
    .filter('sumOfValue', function () {
        return function (data, key) {
            if (typeof (data) === 'undefined' || typeof (key) === 'undefined') {
                return 0;
            }
            var sum = 0;
            for (var i = 0; i < data.length; i++) {
                sum = sum + parseInt(data[i][key]);
            }
            return sum;
        }
    })

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
