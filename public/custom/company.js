'use strict';

angular.module('app').controller('CompanyCtrl', ['$scope','$ngBootbox' ,'$http','socket_url',
    function($scope,$ngBootbox,$http ,socket_url ) {
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
        // when landing on the page, get all todos and show them
        $http.get('/api/companys')
            .success(function(data) {
                $scope.companys = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });

        //
        $scope.add_company = function(){
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                templateUrl: 'tpl/custom/company/add_company.html',
                title: 'Thêm Công Ty '
            });
        }
        $scope.add = function() {
            $http.post('/api/logs', {
                active : "Thêm Công Ty " + $scope.company,
                time : new Date().getTime(),
                type : 'info',
                user : $scope.session_user.name
            }) .success(function(data) {
                socket.emit('update-server',{node : 'log'});
            })
            $http.post('/api/companys', {
                company : $scope.company,
                vat : $scope.vat,
                mst : $scope.mst
            }) .success(function(data) {
                if($scope.room){
                    $scope.room.company = {
                        company : $scope.company,
                        vat : $scope.vat,
                        mst : $scope.mst
                    }
                }
                if($scope.room_post) {
                    $http.post('/api/book_choose_company/', {
                        room_id: $scope.room_post._id, company: {
                            company: $scope.company,
                            vat: $scope.vat,
                            mst: $scope.mst
                        }
                    })
                        .success(function(data) {
                            socket.emit('update-server',{node : 'company'});
                        })
                        .error(function(data) {
                            console.log('Error: ' + data);
                        });
                }

                socket.emit('update-server',{node : 'company'});
                $ngBootbox.hideAll();
            })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
//update
        $scope.edit_detail = function(key,id){
            var value = $("#"+key+id).val();
            $http.post('/api/update_companys/' ,{id : id , key : key , value : value})
                .success(function(data) {
                    //  socket.emit('update-server');
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        $scope.change_status = function(id,value){
            $http.post('/api/update_companys/' ,{id : id , key : 'status' , value : value})
                .success(function(data) {
                    socket.emit('update-server',{node : 'company'});
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

// delete a company after checking it
        $scope.del = function(company) {
            $http.post('/api/logs', {
                active : "Xóa Công Ty " + company.company,
                time : new Date().getTime(),
                type : 'warning',
                user : $scope.session_user.name
            }) .success(function(data) {
                socket.emit('update-server',{node : 'log'});
            })
            $http.delete('/api/companys/' + company._id)
                .success(function(data) {
                    socket.emit('update-server',{node : 'company'});
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        $scope.edit_company = function(id){
            if( $scope.edit_company_id == null){
                $scope.edit_company_id = id;
            }else{
                if($scope.edit_company_id != id){
                    $scope.edit_company_id = id;
                }else if($scope.edit_company_id != null){
                    $scope.edit_company_id = null;
                }
                socket.emit('update-server',{node : 'company'});
            }
        };
//--------------------------
        $scope.currentPage = 1;
        $scope.pageSize = 15;
        $scope.pageChanged = function(currentPage) {
            $scope.currentPage = currentPage;
        }
        $scope.rulefilter = function (company) {
            return ($scope.session_user.role == 'admin' || $scope.session_user.name == company.create_by);
        }
    }
]);
