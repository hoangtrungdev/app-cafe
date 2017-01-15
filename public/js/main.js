'use strict';

/* Controllers */

app.controller('AppCtrl', ['$scope','socket_url','$firebaseObject','$firebaseArray', '$translate', '$localStorage', '$window','$cookieStore' ,'$state' , '$location' ,'$timeout', '$http' ,
    function($scope,socket_url,$firebaseObject,$firebaseArray,   $translate,   $localStorage,   $window , $cookieStore ,$state ,$location,$timeout,$http) {
        var socket = io.connect(socket_url);


        $scope.$on('$locationChangeStart', function(event) {
            // socket.disconnect();
            $scope.session_user =  $cookieStore.get('session_user');
            $scope.session_staff =  $cookieStore.get('session_staff');
            if( $scope.session_user  === undefined  ){
                if($scope.session_staff  === undefined ){
                    $location.path('/login')
                }else{
                    $location.path('/default')

                }

            }else{
                if($scope.session_user.role != 'admin'){
                    $location.path('/default')
                }
            }
        });
        $scope.$on(Keypad.MODIFIER_KEY_PRESSED, function(event,key,id){
            switch(key){
                case "SHIFT":
                    $scope.shift = !$scope.shift;
                    break;
            }
            $scope.$apply();
        });

        $scope.config = {} ;
        $http.get('/api/globals')
            .success(function(data) {
                angular.forEach(data, function(config) {
                    $scope.config[config.key] = config.value ;
                })
            })

        $scope.logout = function(){
            $cookieStore.remove('session_user');
            $cookieStore.remove('session_staff');
            $location.path('/login')
        }

        if($(window).width() <= 767 ){
            $scope.is_mobile_abc = true ;
        }else{
            $scope.is_mobile_abc = false ;
        }
        $(window).resize(function(){
            $timeout(function(){
                if($(window).width() <= 767 ){
                    $scope.is_mobile_abc = true ;
                }else{
                    $scope.is_mobile_abc = false ;
                }
            },100);

        })


        // add 'ie' classes to html
        var isIE = !!navigator.userAgent.match(/MSIE/i);
        isIE && angular.element($window.document.body).addClass('ie');
        isSmartDevice( $window ) && angular.element($window.document.body).addClass('smart');

        // config
        $scope.app = {
            name: 'Sơn Trà',
            version: 'Developed By BITS . Hoàng Trung',
            // for chart colors
            color: {
                primary: '#7266ba',
                info:    '#23b7e5',
                success: '#27c24c',
                warning: '#fad733',
                danger:  '#f05050',
                light:   '#e8eff0',
                dark:    '#3a3f51',
                black:   '#1c2b36'
            },
            settings: {
                themeID: 1,
                navbarHeaderColor: 'bg-black',
                navbarCollapseColor: 'bg-white-only',
                asideColor: 'bg-black',
                headerFixed: true,
                asideFixed: true,
                asideFolded: false,
                container: false
            }
        }

        // save settings to local storage
        if ( angular.isDefined($localStorage.settings) ) {
            $scope.app.settings = $localStorage.settings;
        } else {
            $localStorage.settings = $scope.app.settings;
        }
        $scope.$watch('app.settings', function(){
            if( $scope.app.settings.asideDock  &&  $scope.app.settings.asideFixed ){
                // aside dock and fixed must set the header fixed.
                $scope.app.settings.headerFixed = true;
            }
            // save to local storage
            $localStorage.settings = $scope.app.settings;
        }, true);

        // angular translate
        $scope.lang = { isopen: false };
        $scope.langs = {en:'English', de_DE:'German', it_IT:'Italian'};
        $scope.selectLang = $scope.langs[$translate.proposedLanguage()] || "English";
        $scope.setLang = function(langKey, $event) {
            // set the current lang
            $scope.selectLang = $scope.langs[langKey];
            // You can change the language during runtime
            $translate.use(langKey);
            $scope.lang.isopen = !$scope.lang.isopen;
        };

        function isSmartDevice( $window )
        {
            // Adapted from http://www.detectmobilebrowsers.com
            var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
            // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
            return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
        }

        //---------------------
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

    }]);