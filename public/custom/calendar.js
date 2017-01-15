'use strict';
angular.module('app').controller('FullcalendarCtrl', ['$scope','FURL','$firebaseObject','$firebaseArray','$ngBootbox' ,'$timeout' ,'toaster' ,
    function($scope,FURL,$firebaseObject,$firebaseArray,$ngBootbox,$timeout , toaster) {
        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();
        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
        });
        /* event source that contains custom events on the scope */
        var ref = new Firebase(FURL);

        $scope.events = $firebaseArray(ref.child('events').orderByChild("start"));

        /* alert on dayClick */
        $scope.precision = 400;
        $scope.lastClickTime = 0;
        $scope.alertOnEventClick = function( date, jsEvent, view ){
            var time = new Date().getTime();
            if(time - $scope.lastClickTime <= $scope.precision){
                var date_add = new Date(date);
                ref.child('room_type').once('value', function(snap)  {
                    ref.child('events/').push({
                        room_types : snap.val()  ,
                        title: 'Ngày Lễ Mới',info : 'Đang Cập Nhật',
                        start:  new  Date(date_add.getFullYear(), date_add.getMonth(), date_add.getDate()).getTime(),className: ['b-l b-2x b-info']
                    });
                })
            }
            $scope.lastClickTime = time;
        };


        /* alert on Drop */
        $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
            var date_add = new Date(event.start._d);
            ref.child('events/'+event.$id).update({start : new  Date(date_add.getFullYear(), date_add.getMonth(), date_add.getDate()).getTime() });
            $scope.events = $firebaseArray(ref.child('events').orderByChild("start"));

        };
        /* alert on Resize */
        $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view){
            $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
        };
        /* event on Click */
        $scope.eventClick = function(event, jsEvent, view){
            $scope.id_event = event.$id;
            $scope.room_types = $firebaseArray(ref.child('events/'+event.$id+'/room_types'));
            $ngBootbox.customDialog({
                scope : $scope,
                backdrop: true,
                className: 'class-full',
                templateUrl: 'tpl/custom/calendar/add_price.html',
                title: 'Chỉnh Giá Ngày Lễ - ' + event.title
            });
        };
        $scope.edit_price = function(id_event,key,id){
            var value = $("#"+key+id).val();
            ref.child('events/'+id_event+'/room_types/' + id + '/' + key).set(value, function(){});
        };
        //--------------------------------------------------------
        $('.fc-prev-button').on('click',function(){
            alert('prev is clicked, do something');
        });

        $('.fc-next-button').on('click',function(){
            alert('nextis clicked, do something');
        });
        //------------------------------------------------------
        $scope.overlay = $('.fc-overlay');
        $scope.alertOnMouseOver = function( event, jsEvent, view ){
            $scope.event = event;
            $scope.overlay.removeClass('left right').find('.arrow').removeClass('left right top pull-up');
            var wrap = $(jsEvent.target).closest('.fc-event');
            var cal = wrap.closest('.calendar');
            var left = wrap.offset().left - cal.offset().left;
            var right = cal.width() - (wrap.offset().left - cal.offset().left + wrap.width());

            if( right > $scope.overlay.width() ) {
                $scope.overlay.addClass('left').find('.arrow').addClass('left pull-up')
            }else if ( left > $scope.overlay.width() ) {
                $scope.overlay.addClass('right').find('.arrow').addClass('right pull-up');
            }else{
                $scope.overlay.find('.arrow').addClass('top');
            }
            (wrap.find('.fc-overlay').length == 0) && wrap.append( $scope.overlay );
        }

        /* config object */
        $scope.uiConfig = {
            calendar:{
                height: 500,
                editable: true,
                header:{
                    left: 'prev',
                    center: 'title',
                    right: 'next'
                },
                timezone : 'local',
                dayClick: $scope.alertOnEventClick,
                eventDrop: $scope.alertOnDrop,
                eventResize: $scope.alertOnResize,
                eventMouseover: $scope.alertOnMouseOver,
                eventClick: $scope.eventClick
            }
        };

        /* add custom event*/
        $scope.addEvent = function() {
            ref.child('events/').push({title: 'Ngày Lễ Mới',info : 'Đang Cập Nhật',start: new Date(y, m, d).getTime(),className: ['b-l b-2x b-info']});
        };

        /* remove event */
        $scope.remove = function(id) {
            ref.child('events/' + id).remove(function(){});
        };
        // update
        $scope.update = function(id ,key ){
            var value = $("#"+key+id).val();
            ref.child('events/' + id + '/' + key).set(value, function(){});
        };
        $scope.update_all = function(id_event ,value ){
            ref.child('events/'+id_event+'/room_types/').once('value', function(snap)  {
                angular.forEach(snap.val(), function(type_room,type_key) {
                    ref.child('events/'+id_event+'/room_types/' + type_key + '/day').set(Math.round(type_room.day*(value/100 + 1)), function(){});
                    ref.child('events/'+id_event+'/room_types/' + type_key + '/hour').set(Math.round(type_room.hour*(value/100 + 1)), function(){});
                    ref.child('events/'+id_event+'/room_types/' + type_key + '/hour1').set(Math.round(type_room.hour1*(value/100 + 1)), function(){});
                    ref.child('events/'+id_event+'/room_types/' + type_key + '/hour2').set(Math.round(type_room.hour2*(value/100 + 1)), function(){});
                    ref.child('events/'+id_event+'/room_types/' + type_key + '/hour3').set(Math.round(type_room.hour3*(value/100 + 1)), function(){});
                })
            })
            toaster.pop('info','Thông Báo !','Cập Nhật Giá Thành Công');

        };

        /* event sources array*/
        $scope.eventSources = [$scope.events];
    }]);
/* EOF */