'use strict';

angular.module('app').controller('MapCtrl', ['$scope','$ngBootbox' ,'$http','socket_url','$interval',
    function($scope,$ngBootbox,$http ,socket_url,$interval ) {

        var socket = io.connect(socket_url);

        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
        });
        $http.get('/api/maps') .success(function(data) {
            $scope.maps = data;
            angular.forEach($scope.maps, function(map,key) {
                if(key == 0 ){
                    $scope.focus_now = map._id;
                }
            })
        })
        socket.on('update-client-map', function() {
            $http.get('/api/maps').success(function(data) {
                    $scope.maps = data;
                });
        });
        //--------------------------
        $http.get('/api/rooms') .success(function(data) {
            $scope.rooms = data;
        })
        socket.on('update-client-room', function() {
            $http.get('/api/rooms').success(function(data) {
                $scope.rooms = data;
            });
        });

        $scope.getClassRoom = function(room){
            var done = true ;
            if(room.bill != ''){
                angular.forEach(room.bill, function(service) {
                    if(service.status != false){
                        done = false ;
                    }
                })
                if(done){
                    return 'table-done';
                }else{
                    return 'table-wait';
                }
            }else{
                if(room.status){
                    return 'table-book';
                }else {
                    return '';
                }
            }
        }
        $scope.upload_img = function (id , img) {
            if(img != null){
                $http.post('/upload' ,{ 'filetype' : img.filetype ,'filename' : id+img.filename , value : img.base64})
                    .success(function(abc) {
                        $http.post('/api/update_maps/' ,{id : id , key : 'img' , value : id+img.filename}).success(function(abc) {
                            socket.emit('update-server',{node : 'map'});
                        })
                    })
            }
        };
        //--------------------------
        $scope.set_focus = function(id){
            $scope.focus_now = id ;
        }
           $scope.add_floor_click = function(){
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                templateUrl: 'tpl/custom/map/add_floor.html',
                title: 'Thêm Tầng '
            });
        }

        $scope.add_floor = function() {
            $http.post('/api/maps', { name : $scope.name })
                .success(function(data) {
                    socket.emit('update-server',{node : 'map'});
                    $ngBootbox.hideAll();
                })
        };
        $scope.edit_floor = function(id){
            if( $scope.edit_room_id == null){
                $scope.edit_room_id = id;
            }else{
                if($scope.edit_room_id != id){
                    $scope.edit_room_id = id;
                }else if($scope.edit_room_id != null){
                    $scope.edit_room_id = null;
                }
                socket.emit('update-server',{node : 'room'});
            }
        };
        //update
        $scope.edit_floor_detail = function(id){
            var value = $("#map"+id).val();
            $http.post('/api/update_maps/' ,{id : id , key : 'name' , value : value})
                .success(function(data) {
                    //  socket.emit('update-server');
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
        $scope.status_edit = false ;
        $scope.change_status = function(){
            $scope.status_edit = !$scope.status_edit;
            if($scope.status_edit == false){
                $scope.edit_room_id = null;
            }
        };
        // delete a map after checking it
        $scope.del_floor = function(id) {
            $http.delete('/api/maps/' + id)
                .success(function(data) {
                    socket.emit('update-server',{node : 'map'});
                })
        };
        $scope.actionSetPosition = function(event, ui ,id){
            console.log(ui.offset.top);
            console.log(ui.offset.left);
            $http.post('/api/update_rooms/',{id : id , key : 'top' , value : (ui.offset.top - 181)})
            $http.post('/api/update_rooms/',{id : id , key : 'left' , value :(ui.offset.left - 11)})
        };
        $scope.actionChooseTable = function(table){
            $scope.table_now = table
            socket.emit('update-server',{node : 'room'});
        }
        $scope.actionClearTableChoose = function(){
            $scope.table_now = '';
            socket.emit('update-server',{node : 'room'});
        }
    //---------------------------------------------------------
        $scope.set_floor = function(id){$("#floor_id").val(id)};
        $scope.add_room = function(){
            $http.post('/api/rooms', {floor_id : $("#floor_id").val() ,name: $scope.name})
                .success(function(data) {
                    socket.emit('update-server',{node : 'room'});
                    $ngBootbox.hideAll();
                })
        }
        $scope.actionDeleteRoom = function(room){
            $http.delete('/api/rooms/' + room._id)
                .success(function(data) {
                    socket.emit('update-server',{node : 'room'});
                })
        }
        $scope.actionUpdateRoomName = function(room){
            $http.post('/api/update_rooms/',{id : room._id , key : 'name' , value : room.name})
        };
        //---------------------------------------------------------
        $scope.array_room = new Array();
        $scope.array_room_change = function(id ,fid){
            var para = fid + "|room|" + id ;
            if($.inArray(para, $scope.array_room) > -1){
                $scope.array_room.splice($scope.array_room.indexOf(para),1);
            }else{
                $scope.array_room.push(para);
            }
        };
        $scope.array_room_edit = new Array();
        $scope.array_room_edit_change = function(id ,fid){
            var para = fid + "|room|" + id ;
            if($.inArray(para, $scope.array_room_edit) > -1){
                $scope.array_room_edit.splice($scope.array_room_edit.indexOf(para),1);
            }else{
                $scope.array_room_edit.push(para);
            }
        };

        //-----------------------------------------------------------------
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
            if(type == 's') timeString +=  (s + "s")

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
            if(days > 0) { timeString += (days + "d")}else
            if(hours > 0){ timeString += (hours + "h") } else
            if(minutes > 0) { timeString +=  (minutes + "m") } else
            if(s >= 0) timeString +=  (s + "s")
            return timeString;
        }


    }
]);
