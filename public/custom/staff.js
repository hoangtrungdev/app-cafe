'use strict';

angular.module('app').controller('StaffCtrl',  ['$scope','$ngBootbox' ,'$http','socket_url','$timeout',
    function($scope,$ngBootbox,$http ,socket_url,$timeout ) {
        var socket = io.connect(socket_url);
        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
        });
        socket.on('update-client-staff', function() {
            $http.get('/api/staffs')
                .success(function(data) {
                    $scope.staffs = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
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
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        });



        // when landing on the page, get all todos and show
        $scope.role = 'staff';
        $scope.add_staff = function(){
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                className: 'd-pop',
                templateUrl: 'tpl/custom/staff/add_staff.html',
                title: 'Thêm Nhân Viên '
            });
        }
        $http.get('/api/staffs')
            .success(function(data) {
                $scope.staffs = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });

        //
        $scope.add = function() {
            $http.post('/api/logs', {
                active : "Thêm Nhân Viên " + $scope.name,
                time : new Date().getTime(),
                type : 'info',
                staff : $scope.session_user.name
            }) .success(function(data) {
                socket.emit('update-server',{node : 'log'});
            })
            $http.post('/api/staffs',{data : {
                    name : $scope.name,
                    username : $scope.username,
                    password : $scope.password,
                    address : $scope.address,
                    email : $scope.email,
                    phone : $scope.phone
                }
                })
                .success(function(data) {
                    socket.emit('update-server',{node : 'staff'});
                    $ngBootbox.hideAll();
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        //update
        $scope.edit_detail = function(key,id){
            var value = $("#"+key+id).val();
            $http.post('/api/update_staffs/' ,{id : id , key : key , value : value})
                .success(function(data) {
                    //  socket.emit('update-server');
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        $scope.change_status = function(id,value){
            $http.post('/api/update_staffs/' ,{id : id , key : 'status' , value : value})
                .success(function(data) {
                    socket.emit('update-server',{node : 'staff'});
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

        // delete a staff after checking it
        $scope.del = function(staff) {
            $http.post('/api/logs', {
                active : "Xóa Nhân Viên " + staff.name,
                time : new Date().getTime(),
                type : 'warning',
                staff : $scope.session_staff.name
            }) .success(function(data) {
                socket.emit('update-server',{node : 'log'});
            })
            $http.delete('/api/staffs/' + staff._id)
                .success(function(data) {
                    socket.emit('update-server',{node : 'staff'});
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        $scope.edit_staff = function(id){
            if( $scope.edit_staff_id == null){
                $scope.edit_staff_id = id;
            }else{
                if($scope.edit_staff_id != id){
                    $scope.edit_staff_id = id;
                }else if($scope.edit_staff_id != null){
                    $scope.edit_staff_id = null;
                }
                socket.emit('update-server',{node : 'staff'});
            }
        };
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


        $scope.currentPage = 1;
        if($(window).width() <= 1024 ){
            var reduce_size = 280 ;
            $scope.tablet_hide = true ;
        }else{
            var reduce_size = 350 ;
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
                var reduce_size = 280 ;
                $scope.tablet_hide = true ;
            }else{
                var reduce_size = 350 ;
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
        //-------------------
        $scope.currentPage_ck = 1;
        $scope.pageSize_ck = 5 ;
        $scope.pageChanged_ck = function(currentPage_ck) {
            $scope.currentPage_ck = currentPage_ck;
        }
        //-------------------------------------
        $scope.upload_img = function (id , img) {
            if(img != null){
                $http.post('/upload_staff' ,{ 'filetype' : img.filetype ,'filename' : id+img.filename , value : img.base64})
                    .success(function(abc) {
                        $http.post('/api/update_staffs/' ,{id : id , key : 'img' , value : id+img.filename}).success(function(abc) {
                            socket.emit('update-server',{node : 'staff'});
                        })
                    })
            }
        };
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