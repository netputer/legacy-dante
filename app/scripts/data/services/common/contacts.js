define([
    'underscore'
    ], function(
    _
    ) {
    'use strict';
    return ['$q', '$timeout',
    function($q,   $timeout) {
        // Temporary retain the original logic and writing by boss wang.

        var CONFIG = {
            //The length of contacts that are fetched every times
            'dataLengthOnce' : 150,

            'searchLength' : 30,

            'timeout' : 7000,

            'maxRetryTimes': 3
        };

        var retryTimes = 0;

        function encodeReg (source) {
            return String(source).replace(/([.*+?^=!:${}()|[\]\/\\])/g,'\\$1');
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

        function Contact(dataChannel) {
            this.contacts = [];
            this.dataFinish = false;
            this.fun = undefined;
            this.query = '';
            this.checkedList = [];

            _.extend(this, dataChannel);
        }

        _.extend(Contact.prototype, {
            config : CONFIG,
            checkedList: this.checkedList,
            init : function(){

                if (!this.contacts.length){

                    //自动加载数据，return 一个promise
                    this.getData( 0, CONFIG.dataLengthOnce, null );
                }

            },

            //获取数据
            getData: function( offset, length, cursor ) {
                var self = this;
                cursor = cursor || 0;

                return this.http({
                    method: 'get',
                    url: '/resource/contacts',
                    timeout:CONFIG.timeout,
                    params: {
                        'length':length,
                        'cursor':cursor,
                        'offset':offset
                    }
                }).success( function( data, status, headers ) {
                    retryTimes = 0;
                    _.each( data, function( value ) {
                        if (!checkRepeat(value.id, self.contacts)) {
                            self.contacts.push( value );
                        }
                    });

                    //数据未取完
                    //兼容旧接口没有headers('WD-Need-More')
                    if (!headers('WD-Need-More') && (data.length === length)) {
                        self.getData( self.contacts.length, CONFIG.dataLengthOnce, null );
                    } else if (headers('WD-Need-More') === 'true') {

                        //如果支持cursor打开这个接口，但是速度不如没有cursor的快
                        //this.getData(1,CONFIG.dataLengthOnce,data[l-1].id);
                        //不支持cursor取数据
                        self.getData( self.contacts.length, CONFIG.dataLengthOnce, null );

                    } else {

                        self.dataFinish = true;

                    }

                    if (!!self.fun){
                        self.fun.call(self,data);
                    }

                }).error(function() {
                    $timeout(function() {
                        retryTimes += 1;
                        if (!self.dataFinish && (retryTimes <= CONFIG.maxRetryTimes)) {
                            self.getData( self.contacts.length, CONFIG.dataLengthOnce, null );
                        } else {
                            retryTimes = 0;
                        }
                    }, 1000);
                });
            },


            clearData: function() {
                this.contacts = [];
                this.checkedList.splice(0, this.checkedList.length);
            },

            onchange : function(fun) {

                this.fun = fun;
                if (this.contacts.length) {

                    this.fun.call(this, this.contacts.slice(0, CONFIG.dataLengthOnce));

                    //此时用户切换模块来获取数据，将剩余数据直接返回。
                    if (this.contacts[CONFIG.dataLengthOnce + 1]) {   
                        this.fun.call(this, this.contacts.slice(CONFIG.dataLengthOnce + 1));
                    }
                }
            },

            //取得当前已加载的数据
            getContacts : function() {
                return this.contacts;
            },

            getLoadStatus : function() {
                return this.dataFinish;
            },

            getContactSuggestions: function(query) {
                return this.searchContacts(query, { sms: true });
            },

            //根据query搜索联系人
            searchContacts : function(query ,options) {
                var self = this;
                //存储一下当前的 query 到全局
                this.query = query;

                options = options || {};

                //是否查找email数据
                options.sms = options.sms || false;

                //是否从 cache （ 目前是通过读取 indexDB，将数据加载到 cache 中 ）中读取数据
                var searchCache = !!options.cache;

                var defer = $q.defer();

                //如果没有加载过联系人数据，则自动启动启动加载
                if (!this.contacts.length && !searchCache){
                    this.init();
                }

                query = encodeReg( query.toLocaleLowerCase() );

                var search = function(query , offset , length) {

                    //如果数据未加载完整，从后端搜索，数据完整从前端搜索
                    if (!self.dataFinish && !searchCache) {
                        this.http({
                            method: 'get',
                            url: '/resource/contacts/search',
                            params: {
                                keyword: query,
                                length: length,
                                offset: offset
                            }
                        }).success(function(data){
                            if (query === self.query) {
                                
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

                        _.each( options.cache || self.contacts, function(value) {

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
                        defer.resolve(self.contacts);
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
                for (var i = 0; i < this.contacts.length; i+=1 ) {
                    if (this.contacts[ i ][ 'id' ] === id){
                        contact = this.contacts[ i ];
                    }
                }
                if (contact) {
                    $timeout(function() {
                        defer.resolve(contact);
                    }, 0);
                } else {
                    this.http({
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
                return this.http({
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

                //清除本地数据
                for ( var m = 0 , n = list.length ; m < n ; m += 1 ){
                    for (var i = 0 , l = this.contacts.length ; i < l ; i += 1 ){
                        if (list[m] === this.contacts[i]['id']) {
                            this.contacts.splice(i,1);
                            break;
                        }
                    }
                }

                return this.http({
                    method: 'post',
                    url: '/resource/contacts/delete',
                    data: {'ids':list},
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

                return this.http({
                    method: 'post',
                    url: '/resource/contacts/',
                    data:newData,
                    timeout:CONFIG.timeout
                }).success(function( data ) {
                    _.each(data,function(value) {
                        this.contacts.unshift(value);
                    });
                }).error(function(){
                });
            },

            //编辑联系人
            editContact:function(editData){

                return this.http({
                    method: 'put',
                    url: '/resource/contacts/' + editData.id,
                    data:editData,
                    timeout:CONFIG.timeout
                }).success(function(data) {
                    for (var i = 0 ; i < this.contacts.length ; i += 1 ) {
                        if (this.contacts[i]['id'] === editData.id){
                            this.contacts[i] = editData;
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
            },
            resetRetryTimes: function() {
                retryTimes = 0;
            }
        });


        return Contact;
    }];
});