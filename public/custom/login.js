'use strict';

/* Controllers */
// signin controller
app.controller('LoginController',['$scope','$ngBootbox' ,'$http','socket_url','$state','$cookieStore','$location','$stateParams',
    function($scope,$ngBootbox,$http ,socket_url ,$state ,$cookieStore ,$location,$stateParams) {
        $scope.user = {};
        $scope.authError = null;
        $scope.setType = function (data) {
            $scope.type = data ;
        }
        if($stateParams.type_login){
            $scope.type_login =  $stateParams.type_login;
        }else{
            $scope.type_login =  'staff';
        }
        $scope.login = function() {
            var check = false ;
            $http.get('/api/users')
                .success(function(data) {
                    angular.forEach(data, function(user) {
                        if($scope.user.username.toLowerCase() == user.username.toLowerCase() && $scope.user.password .toLowerCase()== user.password.toLowerCase() ){
                            check = true ;
                            $cookieStore.put('session_user',user);
                            if(user.role !='admin'){
                                $state.go('default')
                            }else{
                                if($scope.type == 'quan-ly'){
                                    $state.go('app.chart')
                                }else{
                                    $state.go('default')
                                }
                            }

                        }
                    })
                    if(!check){
                        $scope.authError = ' Thông Tin Tài Khoản Không Chính Xác ! ';
                    }

                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });


        };
        $scope.login_mod = function() {
            var check = false ;
            $http.get('/api/staffs')
                .success(function(data) {
                    angular.forEach(data, function(staff) {
                        if($scope.user.username.toLowerCase() == staff.username.toLowerCase() && $scope.user.password .toLowerCase()== staff.password.toLowerCase() ){
                            check = true ;
                            $cookieStore.put('session_staff',staff);
                            $state.go('default')
                        }
                    })
                    if(!check){
                        $scope.authError = ' Thông Tin Tài Khoản Không Chính Xác ! ';
                    }

                })


        };
    }]);