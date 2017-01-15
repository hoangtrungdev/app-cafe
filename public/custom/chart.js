'use strict';

angular.module('app').controller('ChartCtrl',  ['$scope','$ngBootbox' ,'$http','socket_url','$timeout' ,'$filter',
    function($scope,$ngBootbox,$http ,socket_url,$timeout ,$filter ) {


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
                    $timeout(abc, 200);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        });
        $http.get('/api/pbss')
            .success(function(data) {
                $scope.pbss = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
        socket.on('update-client-pbs', function() {
            $http.get('/api/pbss')
                .success(function(data) {
                    $scope.pbss = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        });

        $scope.filterDate = function(val) {
            return (($filter('date')(new Date( ), "dd-MM-yyyy") == $filter('date')(val.date, "dd-MM-yyyy")));
        };

        // pagination ----------------------------------
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
        $scope.set_scope = function(key,value){
            $scope[key] = value ;
        }



        $scope.sum_day = new Array()
        socket.on('update-client-checkout', function() {
            $scope.sum_day = new Array();
            $http.get('/api/checkouts')
                .success(function(data) {
                    angular.forEach(data, function(checkout) {
                        if(!checkout.deleted) {
                            if($scope.sum_day[$filter('date')(checkout.date, "dd-MM-yyyy")]){
                                $scope.sum_day[$filter('date')(checkout.date, "dd-MM-yyyy")] = 1*$scope.sum_day[$filter('date')(checkout.date, "dd-MM-yyyy")] + (1*checkout.total + 1*checkout.extra - (1*checkout.reduce  +1*checkout.reduce_coupon ));
                            }else{
                                $scope.sum_day[$filter('date')(checkout.date, "dd-MM-yyyy")] =  (1*checkout.total + 1*checkout.extra - (1*checkout.reduce  +1*checkout.reduce_coupon )) ;
                            }
                        }

                    })
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        });
        $http.get('/api/checkouts')
            .success(function(data) {
                $scope.sum_day = new Array();
                angular.forEach(data, function(checkout) {
                    if(!checkout.deleted) {
                        if($scope.sum_day[$filter('date')(checkout.date, "dd-MM-yyyy")]){
                            $scope.sum_day[$filter('date')(checkout.date, "dd-MM-yyyy")] = 1*$scope.sum_day[$filter('date')(checkout.date, "dd-MM-yyyy")] + (1*checkout.total + 1*checkout.extra - (1*checkout.reduce  +1*checkout.reduce_coupon ));
                        }else{
                            $scope.sum_day[$filter('date')(checkout.date, "dd-MM-yyyy")] =  (1*checkout.total + 1*checkout.extra - (1*checkout.reduce  +1*checkout.reduce_coupon )) ;
                        }
                    }


                })
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });


        $scope.ranges = {
            '7 Ngày Trước': [moment().subtract( 7 ,'days'), moment()],
            '30 Ngày Trước': [moment().subtract( 30 ,'days'), moment()],
            'Tháng Này': [moment().startOf('month'), moment().endOf('month')]
        };
        $scope.d = new Array();
        $scope.tick = new Array();
        $scope.change_date = function(date){
            var max = 30000;
            var min = 1000;
            var startDate = date.startDate ;
            var stopDate = date.endDate ;
            var dateArray_mod = new Array();
            var currentDate_mod = startDate ;
            var i = 0 ;
            $scope.d = new Array();
            $scope.tick = new Array();
            while (currentDate_mod <= stopDate) {
                currentDate_mod = moment(currentDate_mod) + 0 ;
                i = i + 1 ;
                dateArray_mod.push( moment(currentDate_mod) )
                $scope.total = 0 ;
                if($scope.sum_day[$filter('date')(currentDate_mod, "dd-MM-yyyy")] == undefined){
                        $scope.d.push([i,0]);

                }else{
                        $scope.d.push([i,$scope.sum_day[$filter('date')(currentDate_mod, "dd-MM-yyyy")]*1/1000]);
                }
                $scope.tick.push([i,$filter('date')(currentDate_mod, "dd-MM")]);


                currentDate_mod = moment(currentDate_mod) + 60*60*24*1000
            }
            $scope.dateRange =  dateArray_mod;

        }

        $scope.date = {"startDate":moment().subtract( 7 ,'days'),"endDate":moment()}

        $scope.currentPage = 1;
        $scope.pageChanged = function(currentPage) {
            $scope.currentPage = currentPage;
        }
        $scope.show_in_mobile = true ;


        if($(window).width() <= 1280 ){
            $scope.show_in_mobile = false ;
            $scope.pageSize = 8 ;
            if(window.innerHeight > window.innerWidth){
                $scope.pageSize = 12 ;
            }
        }else{
            $scope.show_in_mobile = true ;
            $scope.pageSize = Math.round(($(window).height()-430)/140)*3 ;
        }

        $(window).resize(function(){
            if($(window).width() <= 1280 ){
                $scope.show_in_mobile = false ;
                $scope.pageSize = 8 ;
                if(window.innerHeight > window.innerWidth){
                    $scope.pageSize = 12 ;
                }
            }else{
                $scope.show_in_mobile = true ;
                $scope.pageSize = Math.round(($(window).height()-430)/140)*3 ;

            }
            $timeout(abc,200);
        })
        var is_one = true ;
        var abc = function() {
            $scope.change_date($scope.date);
            if(is_one){
                $timeout(abc, 200);
                is_one = false ;

            }
        }
        $timeout(abc, 200);





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