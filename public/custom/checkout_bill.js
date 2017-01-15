'use strict';

angular.module('app').controller('CheckoutBillCtrl', ['$scope','$ngBootbox' ,'$http','socket_url','$stateParams','$timeout','$state','toaster','$filter','$cookieStore',
    function($scope,$ngBootbox,$http ,socket_url,$stateParams,$timeout,$state,toaster,$filter,$cookieStore ) {
        var socket = io.connect(socket_url);
        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
        });


        socket.on('update-client-bill', function() {
            $http.get('/api/bills')
                .success(function(data) {
                    $scope.bills = data;
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

        //-------------
        $scope.set_scope = function(key,value){
            $scope[key] = value ;
        }
        //-------------
        $scope.del = function(bill) {
            $http.post('/api/logs', {
                active : "Xóa 1 Phiếu Chi ( Tổng Chi : "+ $filter('number')(bill.total ,0) +" )",
                time : new Date().getTime(),
                type : 'warning',
                user : $scope.session_user.name
            }) .success(function(data) {
                socket.emit('update-server',{node : 'log'});
            })
            $http.delete('/api/bills/' + bill._id)
                .success(function(data) {
                    socket.emit('update-server',{node : 'bill'});

                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        $http.get('/api/bills')
            .success(function(data) {
                $scope.bills = data;
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
                templateUrl: 'tpl/custom/checkout_bill/detail.html',
                title: 'Chi Tiết Phiếu Bán Hàng'
            });
        }

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
            frameDoc.document.write('<html><head><title>DIV Contents</title>');
            frameDoc.document.write('</head><body>');
            //Append the external CSS file.
            frameDoc.document.write('<link href="css/print.css" rel="stylesheet" type="text/css" />');
            frameDoc.document.write('<div id="title-bill">'+$scope.config.name+'</div>');
            frameDoc.document.write('<div class="dive-bill">-------------o0o-------------</div>');
            frameDoc.document.write('<div class="info-bill">'+$scope.config.address+'</div>');
            frameDoc.document.write('<div class="info-bill">Điện Thoại:'+$scope.config.phone+'</div>');
            frameDoc.document.write('<div class="info-bill-mod">'+$scope.data_detail.code+'</div>');
            frameDoc.document.write('<div class="dive-bill">---------------------------------------</div>');

            frameDoc.document.write(contents);
            frameDoc.document.write('<div class="bbot-bill">-------------------------------------------------------</div>');
            frameDoc.document.write('<div class="bot-thanks-bill">Xin Cảm Ơn Quý Khách  !</div>');
            frameDoc.document.write('<div class="bot-thanks-bill">Thu Ngân : '+$scope.data_detail.user.name+'</div>');
            frameDoc.document.write('<div class="bot-date-bill">Ngày :'+$filter('date')($scope.data_detail.date, 'dd/MM/yyyy')+' Giờ '+
                $filter('date')($scope.data_detail.date, 'HH:mm')+' </div>');
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

        $scope.data_show = 2 ;

        $scope.currentPage = 1;
        $scope.pageSize = 10;
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
