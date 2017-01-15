'use strict';

angular.module('app').controller('BillCtrl', ['$scope','$ngBootbox' ,'$http','socket_url','$stateParams','$timeout','$state','toaster','$filter','$window',
    function($scope,$ngBootbox,$http ,socket_url,$stateParams,$timeout,$state,toaster ,$filter,$window) {
        var socket = io.connect(socket_url);

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
        //----------------------------------
        $scope.bill_services = Array();
        $scope.paid = 0 ;
        $scope.customer = {name : "Khách Vãng Lai" , code : 'Guest' , email : 'Không sử dụng' , phone : 'Không sử dụng' , address : 'Không sử dụng'}
        $scope.customer_choose = function(cus){
            $scope.customer = cus ;
        };
        $scope.add_customer = function(){
            $scope.method = false;
            $scope.code = 'customer-' + new Date().getTime();
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                templateUrl: 'tpl/custom/customer/add_customer.html',
                title: 'Thêm Khách Hàng '
            });
        }
        socket.on('update-client-customer', function() {
            $http.get('/api/customers')
                .success(function(data) {
                    $scope.customers = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        });

        $scope.add_service = function(){
            $scope.bill_services.push({_id : 'service_' + new Date().getTime(), value : 0 })

        }
        $scope.del_service = function(service){
            var index = $scope.bill_services.indexOf(service);
            $scope.bill_services.splice(index, 1);
        }

        $scope.sum = function(object){
            var sum = 0 ;
            angular.forEach(object, function(service) {
                    sum = sum +  Number(service.value.toString().replace(/[^0-9\.]+/g,""));;
            })
            return sum ;
        }

        //---------------------------------------------
        $scope.alert_now = new Date().getTime()
        $scope.check_max = function(service){
            if(service.qty > service.max){
                service.qty = service.max ;
                if(new Date().getTime() - $scope.alert_now > 1000){
                    $scope.alert_now = new Date().getTime()
                    $ngBootbox.alert(' Sản Phẩm Này Chỉ Còn '+service.max+' Sản Phẩm !!!!')
                }
            }
        }
        $scope.reset = function( ){
            $window.location.reload();
        }
        $scope.save = function( ){
            angular.forEach($scope.bill_services, function(service) {
                $http.post('/api/service_sell/',{service : service}) .success(function(data) {
                    socket.emit('update-server',{node : 'service'});
                })
            })
            $scope.status_hide = true ;
            $http.post('/api/bill/',{bill : {
                code :  $("#code").val() ,
                total : $scope.sum($scope.bill_services)  ,
                paid : $scope.paid  ,
                date : $scope.date  ,
                services : $scope.bill_services  ,
                user :  $scope.session_user  ,
                customer :  $scope.customer
            } })
                .success(function(data) {
                    socket.emit('update-server',{node : 'bill'});
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
            $http.post('/api/logs', {
                active : "Lưu Phiếu Chi "  + $("#code").val() ,
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
            frameDoc.document.write('<div class="bot-date-bill">Ngày :'+$filter('date')( $scope.date , 'dd/MM/yyyy')+' Giờ '+
                $filter('date')($scope.date, 'HH:mm')+' </div>');
            frameDoc.document.write('<div class="bot-text-bill">Hóa Đơn bán hàng chỉ có giá trị khi quý khách yêu cầu xuất hóa dơn GTGT trong ngày. ' +
                'Hóa đơn sẽ được cung cấp trong 10 ngày </div>');
            frameDoc.document.write('<div class="bot-text-bill">VAT invoice shall be available tithin 10 days, only if you ask our staff for' +
                ' the issuance TODAY . NO INVOICE shall be issued for the request after the following day of purchase </div>');
            frameDoc.document.write('<div class="bbot-bill">----------------</div>');
            frameDoc.document.write('<div class="bot-name-bill">Phát triển bởi BITS.VN</div>');

            frameDoc.document.close();
            setTimeout(function () {
                window.frames["frame1"].focus();
                window.frames["frame1"].print();
                frame1.remove();
            }, 500);
        }

    }
]);
