define( [
    'underscore'
], function(
    _
) {
    'use strict';

//$q是promise
return [ '$http', '$q','$rootScope', 'wdSocket', 'wdDev', function ( $http, $q, $rootScope, wdSocket, wdDev) {

    var global = {
        appsList:[],
        firstLoadFunction : undefined,
        newAppList : [],
        retryTimes: 0
    };
    var apps;
    var MAX_RETRY_TIMES = 3;
    function getAppListData() {
        return $http({
            method: 'get',
            url: '/resource/apps?length=9999'
        }).success(function(data) {
            global.appsList = [];
            for(var i = 0, l = data.length; i < l; i += 1) {
                global.appsList.push(apps.changeInfo(data[i]));
            }
        }).error(function() {
        });
    }

    $rootScope.$on('signout', function() {
        apps.clear(); 
    });

    wdSocket.on('refresh', function() {
        apps.clear();
    });

    apps = {
        clear: function() {
            global.retryTimes = 0;
            global.appsList = [];
            global.newAppList = [];
        },

        getApplications : function(){
            return global.appsList ;
        },

        onchange : function(fun){
            global.firstLoadFunction = fun;
            if(global.appsList.length){
                global.firstLoadFunction.call(this,global.appsList);
            }else{
                getAppListData().success(function(){
                    global.retryTimes = 0;
                    global.firstLoadFunction.call(this,global.appsList);
                }).error(function() {
                    global.retryTimes += 1;
                    //第一次取数据失败重试
                    if (global.retryTimes <= MAX_RETRY_TIMES) {
                        apps.onchange(global.firstLoadFunction);
                    } else {
                        global.retryTimes = 0;
                    }
                });
            }
        },

        setNewAppList : function(list){
            global.newAppList = list;
        },

        getNewAppList : function(){
            return global.newAppList;
        },

        //改变某些字段的值
        changeInfo : function(data){

            //将字节换算为兆
            data['apk_size'] = Number(data['apk_size']/1024/1024).toFixed(2);
            switch(data['installed_location']){
                case 1:
                    data['installed_location'] = 'Phone memory';
                break;
                case 2:
                    data['installed_location'] = 'SD card';
                break;
            }

            //是否显示提示
            data['confirmTipShow'] = false;

            //是否显示安装成功
            data['doneTipShow'] = false;

            data['checked'] = false;
            
            return data;
        },

        resetRetryTimes: function() {
            global.retryTimes = 0;
        }

    };

    return apps;

}];
});
