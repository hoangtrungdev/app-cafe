'use strict';

angular.module('app', [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngTouch',
        'ngStorage',
        'ui.router',
        'ui.bootstrap',
        'ui.load',
        'ui.jq',
        'ui.validate',
        'oc.lazyLoad',
        'pascalprecht.translate',
        'firebase',
        'ngBootbox',
        'ui.select',
        'ngSanitize',
        'toaster',
        'cfp.hotkeys',
        'ngCookies',
        'base64',
        'naif.base64',
        'ngBootstrap',
        'ngKeypad',
        'ngDragDrop'
    ])
    .constant('FURL','https://trung-app.firebaseio.com/')
    .constant('socket_url','http://localhost:8383/');
angular.module('app').directive('stringToTimestamp', function() {
    return {
        require: 'ngModel',
        link: function(scope, ele, attr, ngModel) {
            // view to model
            ngModel.$parsers.push(function(value) {
                return Date.parse(value);
            });
        }
    }
});
angular.module('app').directive('myRepeatDirective', function(){
    return function(scope, element){
        var footableTable = element.parents('table');


        if( !scope.$last ) {
            return false;
        }

        scope.$evalAsync(function(){

            if (! footableTable.hasClass('footable-loaded')) {
                footableTable.footable();
            }else{
                footableTable.trigger('footable_initialized');
                footableTable.trigger('footable_resize');
                footableTable.data('footable').redraw();
            }


        });

    };
})
angular.module('app').directive('numberMask', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.$evalAsync(function(){
                $(element).number(true,0);
            })

        }
    }
});

angular.module('app').directive('slideToggle', function() {
    return {
        restrict: 'A',
        scope:{
            isOpen: "=slideToggle"
        },
        link: function(scope, element, attr) {
            var slideDuration = parseInt(attr.slideToggleDuration, 10) || 200;
            scope.$watch('isOpen', function(newVal,oldVal){
                if(newVal !== oldVal){
                    element.stop().slideToggle(slideDuration);
                }
            });
        }
    };
});



angular.module('app').filter('startFrom', function() {
    return function(input, start) {
        if(input!=undefined){
            start = +start; //parse to int
            return input.slice(start);
        }
    }
});
angular.module('app').filter('propsFilter', function() {
    return function(items, props) {
        var out = [];

        if (angular.isArray(items)) {
            items.forEach(function(item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if(item[prop]){
                        if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                            itemMatches = true;
                            break;
                        }
                    }

                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    }
});
angular.module('app').factory('socket', function ($rootScope) {
    var socket = io.connect();
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
});
angular.module("app")
    .filter('sumValueService', function () {
        return function (data) {

            if (typeof (data) === 'undefined' ) {
                return 0;
            }
            var sum = 0;

            for (var i = 0; i < data.length; i++) {
                sum = sum + parseInt(data[i]['qty']*data[i]['price'] + data[i]['price_extra']);
            }
            return sum;
        }
    })