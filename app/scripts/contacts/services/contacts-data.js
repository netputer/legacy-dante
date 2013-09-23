define( [
    'underscore'
], function(
    _
) {
    'use strict';

//$q是promise
return [ '$http', '$q','$rootScope', '$timeout', 'wdSocket', function ( $http, $q, $rootScope, $timeout, wdSocket) {

    //配置项
    var CONFIG = {

        //每次拉取联系人列表数据的长度
        'dataLengthOnce' : 150,

        //搜索时需要的长度
        'searchLength' : 30,

        //统一的超时时间
        'timeout' : 7000
    };

    var global = {

        //全局存储联系人列表的数据
        'contacts' : [],

        //数据是否拉取完成
        'dataFinish' : false,

        //临时存储onchange中触发的函数
        'fun' : undefined,

        //记录上次搜索的 query，如果短时间再次调用该方法，会比对下 query 是否相同，如果相同则返回结果
        'query' : ''
    };

    wdSocket.on('refresh', function() {
        global.contacts = [];
    });

    var me = this;

    function encodeReg (source) {
        return String(source).replace(/([.*+?^=!:${}()|[\]\/\\])/g,'\\$1');
    }

    //获取数据
    function getData( offset, length, cursor ) {
        cursor = cursor || 0;

        return $http({
            method: 'get',
            url: '/resource/contacts',
            timeout:CONFIG.timeout,
            params: {
                'length':length,
                'cursor':cursor,
                'offset':offset
            }
        }).success( function( data, status, headers ) {

            _.each( data, function( value ) {
                if (!checkRepeat(value.id, global.contacts)) {
                    global.contacts.push( value );
                }
            });

            //数据未取完
            //兼容旧接口没有headers('WD-Need-More')
            if (!headers('WD-Need-More') && (data.length === length)) {
                getData( global.contacts.length, CONFIG.dataLengthOnce, null );
            } else if (headers('WD-Need-More') === 'true') {

                //如果支持cursor打开这个接口，但是速度不如没有cursor的快
                //getData(1,CONFIG.dataLengthOnce,data[l-1].id);
                //不支持cursor取数据
                getData( global.contacts.length, CONFIG.dataLengthOnce, null );

            } else {

                global.dataFinish = true;

            }

            if (!!global.fun){
                global.fun.call(me,data);
            }

        }).error(function() {
            $timeout(function() {
                if (!global.dataFinish) {
                    getData( global.contacts.length, CONFIG.dataLengthOnce, null );
                }
            }, 1000);
        });
    }

    $rootScope.$on('signout', function() {
        global.contacts = [];
    });

    function deselectAll(){
        for (var i = 0 , l = global.contacts.length ; i < l ; i += 1 ){
            global.contacts[i]['checked'] = false;
        }
    }

    //除重
    function checkRepeat(id, contactsList) {
        for (var i = 0 , l = contactsList.length ; i < l ; i += 1 ) {
            if (contactsList[i].id === id) {
                return true;
            }
        }
        return false;
    }

    //过滤出给短信搜索的数据结构
    function filterSmsSearchContacts( searchList ) {
        var list = [];
        _.each(searchList, function(value) {
            if (value.phone[0]){

                //给简版的逻辑
                _.each(value.phone, function(v) {
                    list.push({
                        name: value.name.display_name,
                        phone: v.number
                    });
                });
            }
        });
        return list;
    }

    //是否从起始位置既匹配
    function isFrontMatch( str, query ) {
        query = query.toLocaleLowerCase().replace(/\s/g,'');
        str = String(str).toLocaleLowerCase().replace(/\s/g,'');
        return new RegExp( '^' + query , 'g' ).test( str );
    }

    //是否在非起始位置有匹配
    function isBehindMatch( str, query ) {
        query = query.toLocaleLowerCase().replace(/\s/g,'');
        str = String(str).toLocaleLowerCase().replace(/\s/g,'');
        return new RegExp( query , 'g' ).test( str );
    }

    //整个service返回接口
    return {

        init : function(){

            if (!global.contacts.length){

                //自动加载数据，return 一个promise
                getData( 0, CONFIG.dataLengthOnce, null );
            }

        },

        onchange : function(fun) {

            global.fun = fun;
            if (global.contacts.length) {

                //这里兼容之前loadmore的逻辑
                global.fun.call( me,global.contacts.slice( 0 , CONFIG.dataLengthOnce ) );
                global.fun.call( me,global.contacts.slice( CONFIG.dataLengthOnce + 1 ) );
            }
        },

        //取得当前已加载的数据
        getContacts : function() {
            return global.contacts;
        },

        getLoadStatus : function() {
            return global.dataFinish;
        },

        getContactSuggestions: function(query) {
            return this.searchContacts(query, { sms: true });
        },

        //根据query搜索联系人
        searchContacts : function(query ,options) {

            //存储一下当前的 query 到全局
            global.query = query;

            options = options || {};

            //是否查找email数据
            options.sms = options.sms || false;

            //是否从 cache （ 目前是通过读取 indexDB，将数据加载到 cache 中 ）中读取数据
            var searchCache = !!options.cache;

            var defer = $q.defer();

            //如果没有加载过联系人数据，则自动启动启动加载
            if (!global.contacts.length && !searchCache){
                this.init();
            }

            query = encodeReg( query.toLocaleLowerCase() );

            var search = function(query , offset , length) {

                //如果数据未加载完整，从后端搜索，数据完整从前端搜索
                if (!global.dataFinish && !searchCache) {
                    $http({
                        method: 'get',
                        url: '/resource/contacts/search',
                        params: {
                            keyword: query,
                            length: length,
                            offset: offset
                        }
                    }).success(function(data){
                        if (query === global.query) {
                            
                            // 是否是给短信模块提供的简版数据
                            if (options.sms){
                                defer.resolve(filterSmsSearchContacts(data));
                            } else {
                                defer.resolve(data);
                            }
                        }
                    }).error(function() {
                        defer.reject();
                    });

                } else {

                    //分为两种权重，最终会将前面的数据和后面的数据拼在一起，就是展示数据。
                    var frontList = [];
                    var behindList = [];

                    //匹配项
                    var matchItem = function (value, itemName, matchItemName) {
                        if (value[itemName] && value[itemName][0]) {
                            for ( var i = 0, l = value[itemName].length ; i < l ; i += 1 ) {
                                if (value[itemName][i][matchItemName]){
                                    var t = value[itemName][i][matchItemName];
                                    if (isFrontMatch(t, query) && !checkRepeat(value.id, frontList)) {
                                        frontList.push(value);
                                        return true;
                                    }
                                    if (isBehindMatch(t, query) && !checkRepeat(value.id, behindList)) {
                                        behindList.push(value);
                                        return true;
                                    }
                                }
                            }
                        }
                        return false;
                    };

                    _.each( options.cache || global.contacts, function(value) {

                        //查名字
                        if (value.name){
                            if ((value.name.given_name && isFrontMatch(value.name.given_name, query)) ||
                                (value.name.middle_name && isFrontMatch(value.name.middle_name, query)) ||
                                (value.name.family_name && isFrontMatch(value.name.family_name, query)) ||
                                (value.name.display_name && isFrontMatch(value.name.display_name, query))
                            ) {
                                if (!checkRepeat(value.id, frontList)) {
                                    frontList.push(value);
                                }
                                return;
                            }

                            if ((value.name.given_name && isBehindMatch(value.name.given_name, query)) ||
                                (value.name.middle_name && isBehindMatch(value.name.middle_name, query)) ||
                                (value.name.family_name && isBehindMatch(value.name.family_name, query)) ||
                                (value.name.display_name && isBehindMatch(value.name.display_name, query))
                            ) {
                                if (!checkRepeat(value.id, behindList)) {
                                    behindList.push(value);
                                }
                                return;
                            }
                        }

                        //查电话号码
                        if (matchItem(value, 'phone', 'number')) {
                            return;
                        }

                        //查 email
                        if (matchItem(value, 'email', 'address')) {
                            return;
                        }

                        //查 sort key （拼音搜索）
                        // if (value.sort_key) {
                        //     var item = value['sort_key'].toLocaleLowerCase();
                        //     var regstr = '^';
                        //     for ( var o = 0, p = query.length; o < p; o += 1 ) {
                        //         regstr = regstr + query[o] + '.*?';
                        //     }
                        //     if (new RegExp( encodeReg(regstr),'g' ).test( item )) {
                        //         frontList.push( value );
                        //         return;
                        //     }
                        // }
                    });

                    var list = frontList.concat( behindList );

                    // 是否是给短信模块提供的简版数据
                    if (options.sms) {
                        $timeout(function() {
                            defer.resolve(filterSmsSearchContacts(list));
                        }, 0);
                    } else {
                        $timeout(function() {
                            defer.resolve(list);
                        }, 0);
                    }
                }
            };

            //执行search
            if (!query) {
                $timeout(function() {
                    defer.resolve(global.contacts);
                }, 0);
            } else {
                search(query, 0, CONFIG.searchLength);
            }
            defer.promise.query = query;

            //搜索更多
            // defer.promise.loadMore = function(offset){
            //     search(query, offset, CONFIG.dataLengthOnce);
            //     return defer.promise;
            // };

            return defer.promise;
        },

        //根据id取得信息
        getContactInfoById: function(id) {
            this.init();
            var contact;
            var defer = $q.defer(); 
            for (var i = 0; i < global.contacts.length; i+=1 ) {
                if (global.contacts[ i ][ 'id' ] === id){
                    contact = global.contacts[ i ];
                }
            }
            if (contact) {
                $timeout(function() {
                    defer.resolve(contact);
                }, 0);
            } else {
                $http({
                    method: 'get',
                    url: '/resource/contacts/' + id
                }).success(function(data){
                    defer.resolve(data);
                });
            }
            return defer.promise;
        },

        //取得账号
        getAccount : function() {
            return $http({
                method: 'get',
                url: '/resource/accounts'
            }).success(function(data) {
            });
        },

        //传入id或者是数组
        delContacts:function(ids){
            var list = [];
            switch(typeof ids){

                //删除一个
                case 'number':
                case 'string':
                    list.push(ids);
                break;

                //删除多个
                default:
                    list = ids;
                break;
            }

            return $http({
                method: 'post',
                url: '/resource/contacts/delete',
                data: {'ids':list},
                timeout: 60 * 60 * 1000
            }).success(function(){
                for ( var m = 0 , n = list.length ; m < n ; m += 1 ){
                    for (var i = 0 , l = global.contacts.length ; i < l ; i += 1 ){
                        if (list[m] === global.contacts[i]['id']) {
                            global.contacts.splice(i,1);
                            return;
                        }
                    }
                }
            }).error(function(){
            });
        },

        //新建联系人
        newContact:function(news){

            //TODO:需要传入对应的account信息
            var newData = [];
            if (Object.prototype.toString.call(news) === '[object Array]') {
                newData = news;
            } else {
                newData.push(news);
            }

            return $http({
                method: 'post',
                url: '/resource/contacts/',
                data:newData,
                timeout:CONFIG.timeout
            }).success(function( data ) {
                _.each(data,function(value) {
                    global.contacts.unshift(value);
                });
            }).error(function(){
            });
        },

        //编辑联系人
        editContact:function(editData){

            return $http({
                method: 'put',
                url: '/resource/contacts/' + editData.id,
                data:editData,
                timeout:CONFIG.timeout
            }).success(function(data) {
                for (var i = 0 ; i < global.contacts.length ; i += 1 ) {
                    if (global.contacts[i]['id'] === editData.id){
                        global.contacts[i] = editData;
                        return;
                    }
                }
            });
        },

        //检查当前输入是否为空，为空返回true
        checkBlank : function(contact) {
            if (!!contact['name']['given_name'] ||!!contact['name']['middle_name']||!!contact['name']['family_name']  ){
                return false;
            }

            for (var m in contact){
                for (var n in contact[m]){
                    switch(m){
                        case 'IM':
                            if (!!contact[m][n]['data']){return false;}
                        break;
                        case 'address':
                            if (!!contact[m][n]['formatted_address']){return false;}
                        break;
                        case 'email':
                            if (!!contact[m][n]['address']){return false;}
                        break;
                        case 'address':
                            if (!!contact[m][n]['formatted_address']){return false;}
                        break;
                        // case 'name':
                        //     if (!!contact[m][n]['family_name']||!!contact[m][n]['given_name']||!!contact[m][n]['middle_name']){return false;}
                        // break;
                        case 'address':
                            if (!!contact[m][n]['formatted_address']){return false;}
                        break;
                        case 'note':
                            if (!!contact[m][n]['note']){return false;}
                        break;
                        case 'organization':
                            if (!!contact[m][n]['company']||!!contact[m][n]['title']){return false;}
                        break;
                        case 'phone':
                            if (!!contact[m][n]['number']){return false;}
                        break;
                        case 'relation':
                            if (!!contact[m][n]['name']){return false;}
                        break;
                        case 'website':
                            if (!!contact[m][n]['URL']){return false;}
                        break;
                    }
                }
            }

            //用户没有输入，返回true
            return true;
        }


    };
}];
});
