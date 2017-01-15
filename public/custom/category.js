'use strict';

angular.module('app').controller('CategoryCtrl', ['$scope','$ngBootbox' ,'$http','socket_url',
    function($scope,$ngBootbox,$http ,socket_url ) {
        var socket = io.connect(socket_url);
        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
        });
        socket.on('update-client-category', function() {
            $http.get('/api/categorys')
                .success(function(data) {
                    $scope.categorys = data;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        });
        // when landing on the page, get all category and show them
        $http.get('/api/categorys')
            .success(function(data) {
                $scope.categorys = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });

        //
        $scope.add_category = function(type){
            $scope.type = type ;
            var  title = '';
            if(type == 'doan'){
                title = 'Thêm Danh Mục Đồ Ăn' ;
            }else{
                title = 'Thêm Danh Mục Đồ Uống' ;
            }
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                className: 'd-pop',
                templateUrl: 'tpl/custom/category/add_category.html',
                title: title
            });
        }
        $scope.add = function() {
            $http.post('/api/logs', {
                active : "Thêm Category " + $scope.name,
                time : new Date().getTime(),
                type : 'info',
                user : $scope.session_user.name
            }) .success(function(data) {
                socket.emit('update-server',{node : 'log'});
            })
            $http.post('/api/categorys', {
                code : $scope.code,
                type : $scope.type,
                name :$scope.name
            }).success(function(data) {
                    socket.emit('update-server',{node : 'category'});
                    $ngBootbox.hideAll();
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
       
       
        $scope.edit_detail = function(key,id){
            var value = $("#"+key+id).val();
            $http.post('/api/update_categorys/' ,{id : id , key : key , value : value})
                .success(function(data) {
                    //  socket.emit('update-server');
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        $scope.change_status = function(id,value){
            $http.post('/api/update_categorys/' ,{id : id , key : 'status' , value : value})
                .success(function(data) {
                    socket.emit('update-server');
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

        // delete a category after checking it
        $scope.del = function(category) {
            $http.post('/api/logs', {
                active : "Xóa Công Ty " + category.name,
                time : new Date().getTime(),
                type : 'warning',
                user : $scope.session_user.name
            }) .success(function(data) {
                socket.emit('update-server',{node : 'log'});
            })
            $http.delete('/api/categorys/' + category._id)
                .success(function(data) {
                    socket.emit('update-server',{node : 'category'});
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        $scope.edit_category = function(id){
            if( $scope.edit_category_id == null){
                $scope.edit_category_id = id;
            }else{
                if($scope.edit_category_id != id){
                    $scope.edit_category_id = id;
                }else if($scope.edit_category_id != null){
                    $scope.edit_category_id = null;
                }
                socket.emit('update-server',{node : 'category'});
            }
        };
        // pagination ----------------------------------
        $scope.set_scope = function(key,value){
            $scope[key] = value ;
        }
        $scope.data_show = 2 ;

        $scope.currentPage = 1;
        $scope.pageSize = 10;
        $scope.pageChanged = function(currentPage) {
            $scope.currentPage = currentPage;
        }
        //-------------------------------------
        $scope.upload_img = function (id , img) {
            if(img != null){
                $http.post('/upload_user' ,{ 'filetype' : img.filetype ,'filename' : id+img.filename , value : img.base64})
                    .success(function(abc) {
                        $http.post('/api/update_categorys/' ,{id : id , key : 'img' , value : id+img.filename}).success(function(abc) {
                            socket.emit('update-server',{node : 'category'});
                        })
                    })
            }
        };
    }
]);
