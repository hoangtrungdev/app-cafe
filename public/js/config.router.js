'use strict';

/**
 * Config for the router
 */
angular.module('app')
    .run(
        [          '$rootScope', '$state', '$stateParams',
            function ($rootScope,   $state,   $stateParams) {
                $rootScope.$state = $state;
                $rootScope.$stateParams = $stateParams;
            }
        ]
    )
    .config(
        [          '$stateProvider', '$urlRouterProvider',
            function ($stateProvider,   $urlRouterProvider) {

                $urlRouterProvider
                    .otherwise('/default');
                $stateProvider
                    .state('default', {
                        url: '/default',
                        templateUrl: 'tpl/default.html' ,
                        resolve: {
                            deps:
                                ['$ocLazyLoad', 'uiLoad',
                                    function( $ocLazyLoad, uiLoad ){
                                        return uiLoad.load(
                                            ['css/default.css']
                                        ).then(
                                            function(){
                                                return $ocLazyLoad.load(['custom/default.js','custom/customer.js']);
                                            }
                                        )
                                    }]
                        }
                    })
                    .state('return', {
                        url: '/return',
                        templateUrl: 'tpl/return.html' ,
                        resolve: {
                            deps:
                                ['$ocLazyLoad', 'uiLoad',
                                    function( $ocLazyLoad, uiLoad ){
                                        return uiLoad.load(
                                                ['css/default.css']
                                            ).then(
                                            function(){
                                                return $ocLazyLoad.load(['custom/return.js','custom/customer.js']);
                                            }
                                        )
                                    }]
                        }
                    })
                    .state('pbs', {
                        url: '/pbs',
                        templateUrl: 'tpl/pbs.html' ,
                        resolve: {
                            deps:
                                ['$ocLazyLoad', 'uiLoad',
                                    function( $ocLazyLoad, uiLoad ){
                                        return uiLoad.load(
                                                ['css/default.css']
                                            ).then(
                                            function(){
                                                return $ocLazyLoad.load(['custom/pbs.js','custom/customer.js']);
                                            }
                                        )
                                    }]
                        }
                    })
                    .state('bill', {
                        url: '/bill',
                        templateUrl: 'tpl/bill.html' ,
                        resolve: {
                            deps:
                                ['$ocLazyLoad', 'uiLoad',
                                    function( $ocLazyLoad, uiLoad ){
                                        return uiLoad.load(
                                                ['css/default.css']
                                            ).then(
                                            function(){
                                                return $ocLazyLoad.load(['custom/bill.js','custom/customer.js']);
                                            }
                                        )
                                    }]
                        }
                    })
                    .state('app', {
                        abstract: true,
                        url: '/app',
                        templateUrl: 'tpl/app.html',
                        resolve: {
                            deps:
                                ['$ocLazyLoad', 'uiLoad',
                                    function( $ocLazyLoad, uiLoad ){
                                        return uiLoad.load(
                                                ['css/mobile.css']
                                            )
                                    }]
                        }
                    })
                    .state('app.map', {
                        url: '/map',
                        templateUrl: 'tpl/custom/map/map.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function( $ocLazyLoad ){
                                    return $ocLazyLoad.load(['custom/map.js']);
                                }]
                        }
                    })
                    .state('app.checkout', {
                        url: '/checkout?code',
                        templateUrl: 'tpl/custom/checkout/checkout.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function( $ocLazyLoad ){
                                    return $ocLazyLoad.load(['custom/checkout.js']);
                                }]
                        }
                    })
                    .state('app.checkout_deleted', {
                        url: '/checkout_deleted',
                        templateUrl: 'tpl/custom/checkout/checkout_deleted.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function( $ocLazyLoad ){
                                    return $ocLazyLoad.load(['custom/checkout.js']);
                                }]
                        }
                    })
                    .state('app.return', {
                        url: '/return?code',
                        templateUrl: 'tpl/custom/checkout_return/checkout.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function( $ocLazyLoad ){
                                    return $ocLazyLoad.load(['custom/checkout_return.js']);
                                }]
                        }
                    })
                    .state('app.pbs', {
                        url: '/pbs',
                        templateUrl: 'tpl/custom/checkout_pbs/checkout.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function( $ocLazyLoad ){
                                    return $ocLazyLoad.load(['custom/checkout_pbs.js']);
                                }]
                        }
                    })
                    .state('app.bill', {
                        url: '/bill',
                        templateUrl: 'tpl/custom/checkout_bill/checkout.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function( $ocLazyLoad ){
                                    return $ocLazyLoad.load(['custom/checkout_bill.js']);
                                }]
                        }
                    })
                    .state('app.store', {
                        url: '/store',
                        templateUrl: 'tpl/custom/store/store.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function( $ocLazyLoad ){
                                    return $ocLazyLoad.load(['custom/store.js']);
                                }]
                        }
                    })
                    .state('app.output', {
                        url: '/output',
                        templateUrl: 'tpl/custom/output/output.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function( $ocLazyLoad ){
                                    return $ocLazyLoad.load(['custom/output.js']);
                                }]
                        }
                    })
                    .state('app.detail_output_add', {
                        url: '/detail_output_add?id',
                        templateUrl: 'tpl/custom/output/detail_output_add.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function( $ocLazyLoad ){
                                    return $ocLazyLoad.load(['custom/store_output_add.js']);
                                }]
                        }
                    })
                    .state('app.detail_store_add', {
                        url: '/detail_store_add?id',
                        templateUrl: 'tpl/custom/store/detail_store_add.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function( $ocLazyLoad ){
                                    return $ocLazyLoad.load(['custom/store_detail_add.js']);
                                }]
                        }
                    })
                    .state('app.detail_store', {
                        url: '/detail_store?id',
                        templateUrl: 'tpl/custom/store/detail_store.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function( $ocLazyLoad ){
                                    return $ocLazyLoad.load(['custom/store_detail.js']);
                                }]
                        }
                    })
                    .state('app.book_room_manual', {
                        url: '/book-room-manual',
                        templateUrl: 'tpl/custom/book_room/book_room_manual.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function( $ocLazyLoad ){
                                    return $ocLazyLoad.load(['custom/book_room_manual.js','custom/customer.js','custom/company.js']);
                                }]
                        }
                    })
                    .state('app.book_room', {
                        url: '/book-room:array_room?type_page',
                        templateUrl: 'tpl/custom/book_room/book_room.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function( $ocLazyLoad ){
                                    return $ocLazyLoad.load(['custom/book_room.js','custom/customer.js']);
                                }]
                        }
                    })
                    .state('app.check_out', {
                        url: '/check-out:array_room',
                        templateUrl: 'tpl/custom/book_room/check_out.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function( $ocLazyLoad ){
                                    return $ocLazyLoad.load(['custom/book_room.js','custom/customer.js','custom/company.js']);
                                }]
                        }
                    })
                    .state('app.category', {
                        url: '/category',
                        templateUrl: 'tpl/custom/category/category.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function( $ocLazyLoad ){
                                    return $ocLazyLoad.load(['custom/category.js']);
                                }]
                        }
                    })
                    .state('app.service', {
                        url: '/service?code&type',
                        templateUrl: 'tpl/custom/service/service.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function( $ocLazyLoad ){
                                    return $ocLazyLoad.load(['custom/service.js']);
                                }]
                        }
                    })
                    .state('app.service_tam', {
                        url: '/service_tam',
                        templateUrl: 'tpl/custom/service_tam/service_tam.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function( $ocLazyLoad ){
                                    return $ocLazyLoad.load(['custom/service_tam.js']);
                                }]
                        }
                    })
                    .state('app.customer', {
                        url: '/customer',
                        templateUrl: 'tpl/custom/customer/customer.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function( $ocLazyLoad ){
                                    return $ocLazyLoad.load(['custom/customer.js']);
                                }]
                        }
                    })
                    .state('app.company', {
                        url: '/company',
                        templateUrl: 'tpl/custom/company/company.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function( $ocLazyLoad ){
                                    return $ocLazyLoad.load(['custom/company.js']);
                                }]
                        }
                    })
                    .state('app.user', {
                        url: '/user',
                        templateUrl: 'tpl/custom/user/user.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function( $ocLazyLoad ){
                                    return $ocLazyLoad.load(['custom/user.js']);
                                }]
                        }
                    })
                    .state('app.staff', {
                        url: '/staff',
                        templateUrl: 'tpl/custom/staff/staff.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function( $ocLazyLoad ){
                                    return $ocLazyLoad.load(['custom/staff.js']);
                                }]
                        }
                    })
                    .state('app.chart', {
                        url: '/chart',
                        templateUrl: 'tpl/custom/chart/chart.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function( $ocLazyLoad ){
                                    return $ocLazyLoad.load(['custom/chart.js','custom/log.js']);
                                }]
                        }
                    })
                    .state('app.log', {
                        url: '/log',
                        templateUrl: 'tpl/custom/log/log.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function( $ocLazyLoad ){
                                    return $ocLazyLoad.load(['custom/log.js']);
                                }]
                        }
                    })
                    .state('app.calendar', {
                        url: '/calendar',
                        templateUrl: 'tpl/custom/calendar/calendar.html',
                        // use resolve to load other dependences
                        resolve: {
                            deps: ['$ocLazyLoad', 'uiLoad',
                                function( $ocLazyLoad, uiLoad ){
                                    return uiLoad.load(
                                            ['vendor/jquery/fullcalendar/fullcalendar.css',
                                                'vendor/jquery/fullcalendar/theme.css',
                                                'vendor/jquery/jquery-ui-1.10.3.custom.min.js',
                                                'vendor/libs/moment.min.js',
                                                'vendor/jquery/fullcalendar/fullcalendar.min.js',
                                                'custom/calendar.js']
                                        ).then(
                                        function(){
                                            return $ocLazyLoad.load('ui.calendar');
                                        }
                                    )
                                }]
                        }
                    })

                    .state('app.coupon', {
                        url: '/coupon',
                        templateUrl: 'tpl/custom/coupon/coupon.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function( $ocLazyLoad){
                                    return $ocLazyLoad.load('toaster').then(
                                        function(){
                                            return $ocLazyLoad.load(['custom/coupon.js']);
                                        }
                                    );
                                }]
                        }
                    })
                    .state('app.supplier', {
                        url: '/supplier',
                        templateUrl: 'tpl/custom/supplier/supplier.html',
                        resolve: {
                            deps: ['$ocLazyLoad',
                                function( $ocLazyLoad ){
                                    return $ocLazyLoad.load(['custom/supplier.js','custom/checkout.js']);
                                }]
                        }
                    })

                    .state('login', {
                        url: '/login?type_login',
                        templateUrl: 'tpl/custom/login/login.html',
                        resolve: {
                            deps:
                                ['$ocLazyLoad', 'uiLoad',
                                    function( $ocLazyLoad, uiLoad ){
                                        return uiLoad.load(
                                                ['css/mobile.css']
                                            ).then(
                                            function(){
                                                return $ocLazyLoad.load(['custom/login.js']);
                                            }
                                        )
                                    }]
                        }
                    })
            }
        ]
    );