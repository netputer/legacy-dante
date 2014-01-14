define([], function() {
'use strict';
return ['GA', 'wdDevice', '$q', '$http', 'wdDev',
function(GA, wdDevice, $q, $http, wdDev) {
return {

    // 通过同一局域网连接
    connectDevice : function(deviceData) {

        GA('connect_device:enter_snappea:'+ deviceData.model);
        GA('check_sign_in:auth_all:all');
        
        // 远程唤醒一下设备
        wdDevice.lightDeviceScreen(deviceData.id);
        
        var defer = $q.defer();
        var authCode = deviceData.authcode;
        var ip = deviceData.ip;
        wdDev.setServer(ip);
        
        // 下面方法统计是否超时会用到
        var timeout = 10000;
        var timeStart = (new Date()).getTime();
        $http({
            method: 'get',
            url: '/directive/auth',
            timeout: timeout,
            params: {
                authcode: authCode,
                'client_time': (new Date()).getTime(),
                'client_name': 'Browser',
                'client_type': 3
            }
            // 自定义的，默认底层做错误控制，但是可以被调用方禁止，这样有些不合规则或遗留的api可以在应用层自己处理错误。
            // disableErrorControl: !$scope.autoAuth
        }).success(function(response) {
            GA('connect_device:connect:success');
            GA('check_sign_in:auth:sucess');
            wdDevice.setDevice(deviceData);
            wdDev.setMetaData(response);
            defer.resolve();
        }).error(function(reason, status, headers, config) {

            // 再次远程唤醒设备
            wdDevice.lightDeviceScreen(deviceData.id);
            
            // 清除之前的设备信息
            wdDevice.clearDevice();

            var action;
            var duration = Date.now() - timeStart;
            if (status === 0) {
                action = (Math.round(duration / 1000) * 1000 < timeout) ? ('unreached:' + duration) : 'timeout';
            } else if (status === 401) {
                action = 'reject:' + duration;
            } else {
                action = 'unknown_' + status + ':' + duration;
            }
            GA('connect_device:connect:fail_' + action);
           
            // 统计失败原因（总）
            GA('check_sign_in:auth:fail_' + action);
            // 统计失败的设备及该设备失败原因
            GA('check_sign_in:auth_fall_model:fail_' + action + '_' + deviceData.model);
            // 统计失败的系统版本
            GA('check_sign_in:auth_fall_sdk:fail_' + action + '_' + deviceData.attributes.sdk_version);
            // 统计失败的 Rom 版本
            GA('check_sign_in:auth_fall_rom:fail_' + action + '_' + deviceData.attributes.rom);
            defer.reject();
        });
        return defer.promise;            
    }
};
}];
});
