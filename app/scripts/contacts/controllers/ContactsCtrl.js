define([
    'fineuploader',
    'underscore',
    'jquery'
], function(
    fineuploader,
    _,
    $
) {
'use strict';

return ['$scope', 'wdAlert', 'wdDev', '$route', 'GA', 'wdcContacts', '$timeout', 'wdKey', '$location', '$window', 'wdToast', '$q',
function ContactsCtrl($scope, wdAlert, wdDev, $route, GA, wdcContacts, $timeout, wdKey, $location, $window, wdToast, $q) {

    //默认头像显示颜色
    var photoColorList = [
        'contact-photo-bg-green',
        'contact-photo-bg-red',
        'contact-photo-bg-blue',
        'contact-photo-bg-pink',
        'contact-photo-bg-orange',
        'contact-photo-bg-wheat',
        'contact-photo-bg-olive-green',
        'contact-photo-bg-blue-green',
        'contact-photo-bg-light-green'
    ];

    //存储当前联系人的数据列表
    var G_contacts = [];

    //联系人显示列表
    var G_list = [];

    //当前显示的联系人列表
    var G_pageList = [];

    //搜索出的联系人列表
    var G_searchList = [];

    //搜索出的数据
    var G_search = [];

    //被点击选择了的元素id
    var G_checkedIds = wdcContacts.checkedList;

    //每次拉取数据的长度
    var DATA_LENGTH_ONCE = 50;

    //标示是否首次进入
    var G_isFirst = true;

    //当前被点击的元素
    var G_clicked = {};

    //数据是否已经加载完成
    var G_dataFinish = false;

    //正在显示的数据，cancel功能的时候会用到
    var G_showingContact = {};

    //各个type字段映射表
    var G_typeMap = $scope.$root.DICT.contactType.TYPE_MAP;

    //IM中使用的字段
    var G_protocol = $scope.$root.DICT.contactType.IM_PROTOCOL;

    //最后一个选择的元素
    var G_lastChecked;

    //按键相关
    var G_keyContact;

    //跳转过来的 id
    var G_routecommandId;

    //搜索为空过嘛，如果为空过则是true
    var G_searchIsNull = false;

    //上传实例
    var G_uploader ;

    //获取数据
    function init() {
        wdcContacts.init();
        wdcContacts.onchange(function(data) {
            getData(data);
        });
    }

    //除重
    function filterContactRepeat(id) {
        if (!id) {
            return;
        }
        for (var i = 0, l = $scope.pageList.length; i < l; i += 1) {
            if ($scope.pageList[i] && $scope.pageList[i].id === id) {
                $scope.pageList.splice(i, 1);
            }
        }
    }

    function checkUrlCommand() {
        var routecommandId = $route.current.params.id;
        if (routecommandId) {
            if (routecommandId === 'new') {
                $scope.isLeftLoadingShow = false;
                $scope.isRightLoadShow = false;
                $scope.isContactsEditShow = true;
                $scope.addNewContact({phone:$route.current.params.phone});
                $location.path('/contacts').search('id', null).search('phone', null).replace();
            } else {
                $scope.isLeftLoadingShow = true;
                $scope.isRightLoadShow = true;
                G_routecommandId = routecommandId;
                wdcContacts.getContactInfoById(routecommandId).then(function(data) {
                    filterContactRepeat(data.id);
                    $scope.isLeftLoadingShow = false;
                    $scope.isRightLoadShow = false;
                    showContacts(data.id, data);
                    $scope.pageList.unshift(getListItem(data));
                    $scope.pageList[0].clicked = true;
                    G_clicked = $scope.pageList[0];
                    $location.path('/contacts').search('id', null).replace();
                });
            }
            return true;
        } else {
            return false;
        }
    }

    //每次加载数据时触发
    function getData(data) {
        G_dataFinish = wdcContacts.getLoadStatus();
        G_contacts.push(data);
        getList(data);
        G_isFirst = false;
        showLoadMore();
        showSelectedNum();
    }

    function getListItem(data) {
        var id = data.id || '';
        var name = (data.name && data.name.display_name) || $scope.$root.DICT.contacts.NO_NAME;
        var phone = (data.phone && data.phone[0] && data.phone[0].number) || (data.email && data.email[0] && data.email[0].address) ||'';
        var photo = data.photo_path || '';
        if (!data.photo_color) {
            data.photo_color = photoColorList[ Math.floor( Math.random() * photoColorList.length ) ];
        }
        var obj = {
            id : id,
            name : name,
            phone : phone,
            photo : photo,
            read_only : data.read_only,
            checked : false,
            photo_color : data.photo_color,
            tooltip : $scope.$root.DICT.contacts.WORDS.select
        };
        for (var i = 0, l = G_checkedIds.length; i < l; i += 1) {
            if (id === G_checkedIds[i]) {
                obj.checked = true;
                obj.tooltip = $scope.$root.DICT.contacts.WORDS.deselect;
            }
        }
        return obj;
    }

    //取得电话号码等列表信息
    function getList(data,isUnshift) {
        var l = data.length;

        //第一次数据已经载入
        if (G_isFirst) {
            $scope.isNewContactDisable = false;
            G_keyContact = wdKey.push('contacts');
        }

        if (G_list.length < 1 && l < 1) {
            $scope.isNoneContacts = true;
        }

        for (var i = 0; i < l; i += 1) {
            var obj = getListItem(data[i]);

            //首次进入默认显示第一个联系人
            if (!i && G_isFirst) {
                if (!checkUrlCommand()) {
                    $scope.isRightLoadShow = false;
                    $scope.isLeftLoadingShow = false;
                    showContacts(obj.id);
                    obj.clicked = true;
                    G_clicked = obj;
                }

            } else {
                obj.clicked = false;
            }

            if (G_isFirst) {
                $scope.pageList.push(obj);
            }

            if (!isUnshift) {
                G_list.push(obj);
            } else {
                G_list.unshift(obj);
            }
        }
    }

    //获取某个联系人的信息
    function getContactsById(id,data) {
        var l = data.length;
        for (var i = 0; i < l; i += 1) {
            if (data[i].id === id ) {
                return data[i];
            }
        }
    }

    //显示对应的联系人
    function showContacts(id, data) {
        var show = function() {
            var i, l;
            $scope.isRightLoadShow = false;
            $scope.isPhotoUploadShow = false;
            G_contacts = wdcContacts.getContacts();
            data = data || getContactsById(id,G_contacts) || getContactsById(id,G_search);
            if (!data) {
                data = G_contacts[0];
                goToListTop();
            }

            //账户信息，存储当前账号
            data.account = {};
            if (data.organization && !data.organization[0]) {
                data.organization[0] = {
                    type:G_typeMap.organization[1],
                    Company:'',
                    department:'',
                    job_description:'',
                    label:'',
                    office_location:'',
                    phonetic_name:'',
                    symbol:'',
                    title:''
                };
            }

            if (!!data.website) {
                for (i = 0, l = data.website.length; i < l; i += 1) {
                    if ( data.website[i].URL.indexOf('http://')<0 ) {
                        data.website[i].URL = 'http://' + data.website[i].URL;
                    }
                }
            }

            if ( data.organization && data.organization[0] && data.organization[0].title && data.organization[0].company ) {

                //要显示的工作信息
                data.workinfo = data.organization[0].title + ', ' + data.organization[0].company;
            } else if ( data.organization && data.organization[0] && data.organization[0].title && !data.organization[0].company ) {
                data.workinfo = data.organization[0].title;
            } else if ( data.organization && data.organization[0] && !data.organization[0][''] && data.organization[0].company ) {
                data.workinfo = data.organization[0].company;
            }
            data = changeDataType(data);
            //备份数据到全局，以便之后cancel时使用
            G_showingContact = {};
            $.extend(true,G_showingContact,data);

            G_clicked.clicked = false;

            for (i = 0,l = $scope.pageList.length; i < l; i += 1) {
                if ( !!$scope.pageList[i].id && $scope.pageList[i].id === id ) {
                    $scope.pageList[i].clicked = true;
                    G_clicked = $scope.pageList[i];
                }
            }

            $scope.contact = data;
            $scope.isContactsEditShow = true;
            $scope.isEditBtnShow = true;
            $scope.isDelBtnShow = true;
            $scope.isSaveBtnShow = false;
            $scope.isCancelBtnShow = false;
            $scope.isSendMessageShow = false;
            $scope.isSendMessageShow = true;
        };

        //点了旁边，没有点保存
        switch($scope.currentStatus) {
            case 'new':
                if (!wdcContacts.checkBlank($scope.contact)) {
                    wdAlert.confirm(
                        $scope.$root.DICT.contacts.DIALOG.SAVE_NEW_CONTACT.TITLE,
                        $scope.$root.DICT.contacts.DIALOG.SAVE_NEW_CONTACT.CONTENT,
                        $scope.$root.DICT.contacts.DIALOG.SAVE_NEW_CONTACT.OK,
                        $scope.$root.DICT.contacts.DIALOG.SAVE_NEW_CONTACT.CANCEL
                    ).then(function() {
                        $scope.saveContact($scope.contact.id);
                        show();
                    },function() {
                        $scope.currentStatus = 'show';
                        $scope.pageList.shift();
                        show();
                    });
                } else {
                    $scope.pageList.shift();
                    $scope.currentStatus = 'show';
                    show();
                }
                break;
            case 'edit':
                wdAlert.confirm(
                    $scope.$root.DICT.contacts.DIALOG.SAVE_EDIT_CONTACT.TITLE,
                    $scope.$root.DICT.contacts.DIALOG.SAVE_EDIT_CONTACT.CONTENT,
                    $scope.$root.DICT.contacts.DIALOG.SAVE_EDIT_CONTACT.OK,
                    $scope.$root.DICT.contacts.DIALOG.SAVE_EDIT_CONTACT.CANCEL
                ).then(function() {
                    $scope.saveContact($scope.contact.id);
                    show();
                },function() {
                    $scope.currentStatus = 'show';
                    show();
                });
            break;
            default:
                show();
            break;
        }
    }

    //删除选中的联系人，传入id删除单个，不传入说明删除多个。
    $scope.deleteContacts = function(id) {
        var i, l;
        GA('Web Contacts:click delete contacts button');

        var word = '';

        //取得read only的账号
        var read_only = [];

        //删除一个
        if (!!id) {
            word = 'contact';

        //删除多个
        } else {
            word = 'contacts';
            for (i = 0 , l = G_list.length; i < l; i += 1) {
                if ( G_list[i].checked === true && G_list[i].read_only ) {
                    read_only.push(G_list[i].name);
                    G_list[i].checked = false;
                }
            }
        }

        var alertTpl = '<p>'+$scope.$root.DICT.contacts.DIALOG.DELETE_CONTACT.ASK+'</p>';
        if (read_only.length > 0) {
            alertTpl += '<p>'+$scope.$root.DICT.contacts.DIALOG.DELETE_CONTACT.READ_ONLY+'</p><ul>';
            for (i = 0 , l = read_only.length; i < l ; i += 1) {
                alertTpl += ('<li>'+read_only[i]+'</li>');
            }
            alertTpl += '</ul>';
        }

        setTimeout(function() {
            $('.modal-body').html(alertTpl);
        },300);

        wdAlert.confirm(
            $scope.$root.DICT.contacts.DIALOG.DELETE_CONTACT.TITLE,
            $scope.$root.DICT.contacts.DIALOG.DELETE_CONTACT.CONTENT,
            $scope.$root.DICT.contacts.DIALOG.DELETE_CONTACT.OK,
            $scope.$root.DICT.contacts.DIALOG.DELETE_CONTACT.CANCEL
        ).then(function() {
            // var toastDefer = $q.defer();
            // toastDefer.promise.content = $scope.$root.DICT.contacts.DEL_TOAST;
            var i, j, l, k, m;

            $('.modal-body').html('');
            $('.modal-backdrop').html('');

            var delId = [];

            //标志是否全部删除成功
            var flagNum = 0;

            //生成delId
            if (!id) {
                for (i = 0 , l = $scope.pageList.length; i < l; i += 1) {
                    if ( $scope.pageList[i].checked === true && !$scope.pageList[i].read_only ) {
                        delId.push($scope.pageList[i].id);
                    }
                }
            } else {
                delId.push(id);
            }

            //取得将被删除的上一个元素，为了删除后跳回目的地
            var delBack;
            for (i = 0 , l = $scope.pageList.length; i < l; i += 1) {
                if ($scope.pageList[i].id === delId[0]) {
                    if ($scope.pageList[i + 1]) {
                        delBack = $scope.pageList[i + 1];
                    } else if ($scope.pageList[i - 1]) {
                        delBack = $scope.pageList[i - 1];
                    }
                }
            }

            //清除删除成功的数据
            for (i = 0 , l = delId.length; i < l; i += 1) {
                for (j = 0 , k = $scope.pageList.length; j < k; j += 1) {
                    if ( $scope.pageList[j].id === delId[i] ) {
                        $scope.pageList.splice(j,1);
                        break;
                    }
                }

                for (j = 0, k = G_list.length; j < k; j += 1) {
                    if ( !!G_list[j] && !!G_list[j].id && G_list[j].id === delId[i]) {
                        G_list.splice(j,1);
                        if (!G_list.length) {
                            $scope.isNoneContacts = true;
                        }
                        break;
                    }
                }

                for (j = 0, k = G_searchList.length; j < k; j += 1) {
                    if ( !!G_searchList[j] && !!G_searchList[j].id && G_searchList[j].id === delId[i]) {
                        G_searchList.splice(j,1);
                        break;
                    }
                }

                for (j = 0, k = G_contacts.length; j < k; j += 1) {
                    if (G_contacts[j] && G_contacts[j].id && G_contacts[j].id === delId[i]) {
                        G_contacts.splice(j, 1);
                        break;
                    }
                }
            }

            if (!!G_clicked && !!G_clicked.clicked) {
                G_clicked.clicked = false;
            }

            $scope.loadMore();
            if (!!$scope.pageList[0]) {
                G_clicked = $scope.pageList[0];
                showContacts(G_clicked.id);
                G_clicked.clicked = true;
                goToListTop();
            } else {
                $scope.isContactsEditShow = false;
            }
            
            if (delId.length > 1) {
                $scope.selectedNum = 0;
                $scope.isDeselectBtnShow = false;
                $scope.isDeleteBtnShow = false;
            } else {
                if ($scope.selectedNum>0) {
                    $scope.selectedNum -= 1;
                }
                if ($scope.selectedNum < 1) {
                    $scope.isDeselectBtnShow = false;
                    $scope.isDeleteBtnShow = false;
                }
            }

            wdcContacts.delContacts(delId).success(function(data) {
                // toastDefer.resolve();
            }).error(function() {
                // toastDefer.reject($scope.$root.DICT.contacts.DEL_ERROR_TOAST);
            });
            // wdToast.apply(toastDefer.promise);

        //then最后的括号
        },

        //cancel时
        function() {
            $('.modal-body').html('');
        });
    };

    //取消所有
    $scope.deselectAll = function() {
        $scope.isDeselectBtnShow = false;
        $scope.isDeleteBtnShow = false;
        $scope.selectedNum = 0;
        G_contacts = wdcContacts.getContacts();
        var i, l;
        for (i = 0, l = G_contacts.length;i<l;i += 1) {
            G_contacts[i].checked = false ;
        }
        for (i = 0, l = $scope.pageList.length;i<l;i += 1) {
            $scope.pageList[i].checked = false ;
        }
        for (i = 0, l = G_searchList.length;i<l;i += 1) {
            G_searchList[i].checked = false ;
        }
        G_checkedIds = [];
    };

    $scope.clickChecked = function(event, item) {
        item.checked = !item.checked;
        if (item.checked === false) {
            GA('Web Contacts:click checkbox unchecked');
            if ($scope.selectedNum > 0) {
                $scope.selectedNum -= 1;
            }
            item.tooltip = $scope.$root.DICT.contacts.WORDS.select;
            for (var i = 0 , l = G_checkedIds.length ; i < l ; i += 1) {
                if (item.id === G_checkedIds[i]) {
                    G_checkedIds.splice(i,1);
                }
            }
        } else {
            GA('Web Contacts:click checkbox checked');
            item.tooltip = $scope.$root.DICT.contacts.WORDS.deselect;
            $scope.selectedNum += 1;
            G_checkedIds.push(item.id);
        }
        if (event.shiftKey) {
            GA('Web Contacts:press shift and click checkbox checked');
            var startIndex = Math.max($scope.pageList.indexOf(G_lastChecked), 0);
            var stopIndex = $scope.pageList.indexOf(item);
            $scope.pageList.slice(Math.min(startIndex, stopIndex), Math.max(startIndex, stopIndex) + 1).forEach(function(v) {
                if (!v.checked) {
                    v.checked = true;
                    v.tooltip = item.tooltip = $scope.$root.DICT.contacts.WORDS.deselect;
                    G_checkedIds.push(v.id);
                    $scope.selectedNum += 1;
                }
            });
        }
        G_lastChecked = item ;
        showSelectedNum();
    };

    //编辑联系人
    $scope.editContact = function(id) {
        GA('Web Contacts:click edit contact button');
        $scope.isSendMessageShow = false;
        G_keyContact.done();

        //addNewContact方法中调用了editContact方法
        if ($scope.currentStatus !== 'new') {
            $scope.currentStatus = 'edit';
            $scope.isPhotoUploadShow = true;
        }

        $scope.isEditBtnShow = false;
        $scope.isDelBtnShow = false;
        $scope.isSaveBtnShow = true;
        $scope.isCancelBtnShow = true;

        $('input').one('click',function(e) {
            e.target.select();
        });

        //图片上传
        photoUpload();
    };

    //保存联系人
    $scope.saveContact = function(id) {

        G_keyContact = wdKey.push('contacts');
        G_keyContact.done();

        //检查是否用户没有填入信息
        if (wdcContacts.checkBlank($scope.contact)) {
            wdAlert.alert($scope.$root.DICT.contacts.DIALOG.ENTER_CONTACT.TITLE,'',$scope.$root.DICT.contacts.DIALOG.ENTER_CONTACT.OK);
            return;
        }
        $scope.isPhotoUploadShow = false;
        var toastDefer = $q.defer();
        toastDefer.promise.content = $scope.$root.DICT.contacts.SAVE_TOAST;

        var saveData = changeDataTypeBack($scope.contact);
        var editData;
        switch($scope.currentStatus) {
            case 'edit':
                GA('Web Contacts:click save the editing contact button');
                editData = filterUpdatedData(saveData);
                wdcContacts.editContact(editData).success(function(data) {
                    var i, l;
                    for (i = 0 , l = $scope.pageList.length; i < l; i += 1) {
                        if (!!id && $scope.pageList[i].id === id) {
                            data.photo_color = $scope.pageList[i].photo_color;
                            $scope.pageList[i] = getListItem(data);
                        }
                    }
                    for (i = 0 , l = G_list.length; i < l; i += 1) {
                        if (!!id && G_list[i].id === id) {
                            data.photo_color = G_list[i].photo_color;
                            G_list[i] = getListItem(data);
                        }
                    }
                    for (i = 0 , l = G_contacts.length; i < l; i += 1) {
                        if (!!id && G_contacts[i].id === id) {
                            G_contacts[i] = data;
                        }
                    }
                    $scope.currentStatus = 'show';
                    showContacts(data.id);
                    G_uploader.uploadStoredFiles();
                    toastDefer.resolve();
                }).error(function() {
                    GA('Web Contacts:save the editing contact failed');
                    toastDefer.reject($scope.$root.DICT.contacts.SAVE_ERROR_TOAST);
                });
            break;
            case 'new':
                GA('Web Contacts:click save the new contact button');
                editData = [];
                editData.push(filterUpdatedData(saveData));
                var account = editData[0].account || {name:'',type:''};
                editData[0].account_name = account.name;
                editData[0].account_type = account.type;
                wdcContacts.newContact(editData).success(function(data) {
                    $scope.pageList.shift();
                    $scope.pageList.unshift(getListItem(data[0]));
                    getList(data,true);
                    $scope.currentStatus = 'show';
                    showContacts(data[0].id);
                    goToListTop();
                    G_uploader.uploadStoredFiles();
                    toastDefer.resolve();
                }).error(function() {
                    wdAlert.alert($scope.$root.DICT.contacts.DIALOG.FAILED_SAVE_NEW.TITLE, '', $scope.$root.DICT.contacts.DIALOG.FAILED_SAVE_NEW.OK).then(function() {showContacts(G_showingContact.id);});
                    $scope.pageList.shift();
                    showContacts(G_showingContact.id);
                    GA('Web Contacts:save new contact failed');
                    toastDefer.reject($scope.$root.DICT.contacts.SAVE_ERROR_TOAST);
                });

            break;
        }
        wdToast.apply(toastDefer.promise);
    };

    //取消编辑联系人
    $scope.cancelContact = function(id) {
        GA('Web Contacts:click cancel contact button');
        $scope.isPhotoUploadShow = false;
        G_keyContact = wdKey.push('contacts');
        switch($scope.currentStatus) {
            case 'new':
                $scope.pageList.shift();

                //无联系人时显示无联系人界面
                if (!G_list.length) {
                    $scope.isNoneContacts = true;
                } else {
                    id = G_list[0].id;
                }
            break;
            case 'edit':
                id = G_clicked.id;
            break;
        }
        $scope.currentStatus = 'show';
        var data = getContactsById(id,G_contacts);
        for (var i in data) {
            data[i] = null;
        }
        $.extend(true,data,G_showingContact);
        showContacts(id);
        $scope.isContactsEditShow = true;
        $scope.isEditBtnShow = true;
        $scope.isDelBtnShow = true;
        $scope.isSaveBtnShow = false;
        $scope.isCancelBtnShow = false;
    };

    //增加一个条目
    $scope.addNewItem = function (id,itemType) {

        var obj = $scope.contact;
        var i = 0;
        switch(itemType) {
            case 'phone':
                i = obj.phone.length;
                obj.phone.push({type:G_typeMap.phone[2], number:''});
            break;
            case 'email':
                i = obj.email.length;
                obj.email.push({type:G_typeMap.email[1], number:''});
            break;
            case 'address':
                i = obj.address.length;
                obj.address.push({type:G_typeMap.address[1], formatted_address:''}); //多个
            break;
            case 'IM':
                i = obj.IM.length;
                obj.IM.push({protocol:G_protocol[0] ,data:''}); //IM比较特殊，使用的protocol
            break;
            // case 'nickname':
            //     i = obj.nickname.length;
            //     obj.nickname.push({type:'Default',name:''});
            // break;
            case 'note':
                i = obj.note.length;
                obj.note.push({type:G_typeMap.note.Default, note:''});
            break;
            case 'website':
                i = obj.website.length;
                obj.website.push({type:G_typeMap.website[1], URL:''});
            break;
            case 'relation':
                i = obj.relation.length;
                obj.relation.push({type:G_typeMap.relation[6], name:''});
            break;
        }
    };

    //删除一个条目
    $scope.delItem = function(key,item) {
        for (var i = 0 , l = $scope.contact[key].length; i<l; i += 1) {
            if ( $scope.contact[key][i] === item ) {
                $scope.contact[key].splice(i,1);
            }
        }
    };

    //添加新的联系人
    $scope.addNewContact = function(newData) {

        GA('Web Contacts:click add a New Contacts button');
        if ( $scope.currentStatus === 'new') { return; }
        $scope.isContactsEditShow = false;
        $scope.isRightLoadShow = true;
        $scope.isNoContactsShow = false;
        var toastDefer = $q.defer();
        toastDefer.promise.content = $scope.$root.DICT.contacts.WAITING;

        //获取用户账户
        wdcContacts.getAccount().success(function(data) {
            $scope.isContactsEditShow = true;
            $scope.isRightLoadShow = false;
            $scope.contact = $scope.contact || [];
            $scope.contact.account = data[0];
            $scope.accounts = data;
            var obj = {
                account_name:'',
                account_type:'',
                photo_path:'',
                IM:[{protocol:G_protocol[0], custom_protocol:'', data:'', label:'', type:G_typeMap.IM[1]}],
                address:[{type:G_typeMap.address[1], city:'', country:'', formatted_address:'', label:'', neightborhood:'', pobox:'', post_code:'', region:'', street:''}],
                email:[{type:G_typeMap.email[1], address:'', display_name:'', label:''}],
                name:{display_name:'',family_name:'',given_name:'',middle_name:'',phonetic_family_name:'',phonetic_given_name:'',phonetic_middle_name:'',prefix:'',suffix:''},
                // nickname:[{type:'Default',label:'',name:''}],
                note:[{type:G_typeMap.note.Default, note:''}],
                organization:[{type:G_typeMap.organization[1], Company:'', department:'', job_description:'', label:'', office_location:'', phonetic_name:'', symbol:'', title:''}],
                phone:[{type:G_typeMap.phone[2], label:'', number:''}],
                relation:[{type:G_typeMap.relation[6], name:'', label:''}],
                website:[{type:G_typeMap.website[1], URL:'', label:''}]
            };

            G_clicked.clicked = false;
            G_clicked = {
                //id也用来标识这是一个新建的联系人条目，在模板中会检测这个属性。
                id : '',
                name : $scope.$root.DICT.contacts.BUTTONS.newContact,
                phone : '',
                photo : '',
                clicked : true
            };
            $scope.pageList.unshift(G_clicked);
            $scope.isNoneContacts = false;
            if (newData && newData.phone) {
                obj.phone[0].number = newData.phone;
            }
            $scope.contact = obj;
            $scope.currentStatus = 'new';
            $scope.editContact();
            goToListTop();
            toastDefer.resolve();
        }).error(function() {
            $scope.cancelContact();
            toastDefer.reject();
        });
        wdToast.apply(toastDefer.promise);

    };

    //改变data中的type值
    function changeDataType(data) {
        var i, l;
        //因为angular的select问题，所以修正type
        for (var k in data) {

            //改变type
            if (!!data[k].type && !!G_typeMap[k] && !!G_typeMap[k][data[k].type]) {
                data[k].type = G_typeMap[k][data[k].type];
            } else if ( !!data[k][0] && !!G_typeMap[k] && ( data[k][0].type + '' ) ) {
                for (i = 0 , l = data[k].length; i < l; i += 1) {

                    //目前每个 type 类型都改为了数字，所以可能会照成异常赋值，赋值前检测原类型是否是数字类型
                    if (!String(data[k][i].type).match(/\D/)) {
                        data[k][i].type = G_typeMap[k][ data[k][i].type ] || $scope.$root.DICT.contactType.DEFAULT;
                    }
                }
            }

            //改变没有type值的
            if (data.note && data.note[0]) {
                for (i = 0, l = data.note.length; i < l; i += 1) {
                    data.note[i].type = 'Default';
                }
            }

            //IM显示protocol
            if (data.IM && data.IM[0]) {
                for (i = 0, l = data.IM.length; i < l; i += 1) {
                    data.IM[i].protocol = G_protocol[data.IM[i].protocol] || data.IM[i].protocol;
                }
            }

        }
        return data;
    }

    //将data中的type值改变回来
    function changeDataTypeBack(data) {

        var obj = {};
        $.extend(true,obj,data);
        var t, i, l;
        for (var k in obj) {

            //改变type
            if ( !!obj[k].type && !!G_typeMap[k] ) {
                for (t in G_typeMap[k]) {
                    if (obj[k].type === G_typeMap[k][t]) {
                        obj[k].type = t;
                    }
                }
            } else if ( !!obj[k][0] && !!G_typeMap[k] && !!obj[k][0].type) {
                for (i = 0 , l = obj[k].length ; i < l ; i += 1 ) {
                    for (t in G_typeMap[k]) {
                        if (obj[k][i].type === G_typeMap[k][t]) {
                            obj[k][i].type = t;
                        }
                    }
                }
            }
        }

        //IM字段中使用protocol代替type
        if (!!obj.IM && !!obj.IM.length) {
            for (i = 0 ,l = obj.IM.length; i < l ; i += 1 ) {
                for (var m in G_protocol) {
                    if (obj.IM[i].protocol === G_protocol[m]) {
                        obj.IM[i].protocol = m;
                    }
                }
            }
        }

        return obj;
    }

    function filterUpdatedData( data ) {
        if ( data.photo_color ) {
            data.photo_color = null;
        }
        if ( data.photo_path) {
            data.photo_path = null;
        }
        return data;
    }

    function photoUpload() {
        var base64 = '';
        G_uploader = new fineuploader.FineUploaderBasic({
            button: $('.contacts-edit .photoUpload')[0],
            request: {
                endpoint: wdDev.wrapURL('/resource/contacts/'+ $scope.contact.id +'/upload/')
            },
            validation: {
                acceptFiles: 'image/*'
            },
            cors: {
                expected: true,
                sendCredentials: true
            },
            multiple:false,
            autoUpload: false,
            callbacks: {
                onSubmit: function(id) {
                    var file = G_uploader.getFile(id);
                    if (!file.type.match('image.*')) {
                        return;
                    } else {
                        var reader = new FileReader();
                        reader.readAsDataURL(file);

                        //显示为base64
                        reader.onload = function(e) {
                            base64 = e.target.result;
                            $scope.contact.photo_path = base64;
                            $scope.$apply();
                        };
                    }
                },
                onComplete : function() {
                    setPhoto(base64);
                }
            }
        });

        function setPhoto(src) {
            for (var i = 0 , l = $scope.pageList.length ; i < l ; i += 1 ) {
                if ($scope.currentStatus === 'new') {
                    $scope.contact.photo_path = src;
                    $scope.pageList[0].photo = src;
                } else {
                    if ($scope.pageList[i].id === G_showingContact.id ) {
                        $scope.pageList[i].photo = src;
                        $scope.contact.photo_path = src;
                        $scope.$apply();
                        return;
                    }
                }
            }
        }
    }

    $scope.clearSearch = function() {
        $scope.isNoContactsShow = false;
        $scope.searchText = '';
        $scope.searchContacts();
    };

    //搜索联系人功能
    $scope.searchContacts = _.debounce(function() {
        $scope.$apply(function() {

            //不是空则执行搜索
            if ( $scope.searchText && (G_contacts.length > 1) ) {
                G_searchIsNull = false;
            } else if (!$scope.searchText && !G_searchIsNull && (G_contacts.length > 1) ) {
                G_searchIsNull = true;
            } else {
                return;
            }
            $scope.isLoadMoreBtnShow = false;
            $scope.isLeftLoadingShow = true;
            var text = $scope.searchText.toLocaleLowerCase();
            $scope.isNoContactsShow = false;
            $scope.isRightLoadShow = true;
            $scope.isContactsEditShow = false;
            $scope.pageList = [];

            //调用搜索接口
            wdcContacts.searchContacts(text).then(function(data) {
                G_searchList = [];
                G_search = [];
                $scope.searchText = $scope.searchText || '';
                G_search = data;
                $scope.isLeftLoadingShow = false;
                $scope.isRightLoadShow = false;
                $scope.isContactsEditShow = true;
                for (var i = 0, l = data.length; i < l; i += 1) {
                    G_searchList.push(getListItem(data[i]));
                }
                if (!!G_searchList[0]) {
                    G_keyContact = wdKey.push('contacts');
                    $scope.isNoContactsShow = false;
                    G_clicked.clicked = false;
                    $scope.pageList = G_searchList.slice(0,DATA_LENGTH_ONCE);
                    $scope.pageList[0].clicked = true;
                    G_clicked = $scope.pageList[0];
                    showContacts($scope.pageList[0].id);
                    $scope.isContactsEditShow = true;
                } else {
                    $scope.isContactsEditShow = false;
                    $scope.isNoContactsShow = true;
                }
                showLoadMore();
                showSelectedNum();
                goToListTop();
            });
        });
    }, 300);

    //加载更多
    $scope.loadMore = function() {
        var pl = $scope.pageList.length;
        var l = $scope.pageList.length + DATA_LENGTH_ONCE;
        if ($scope.searchText) {
            $scope.pageList = $scope.pageList.concat(G_searchList.slice(pl,l));
        } else {
            $scope.pageList = $scope.pageList.concat(G_list.slice(pl,l));
        }
        showLoadMore();
    };

    function showSelectedNum() {
        $scope.selectedNum = 0;
        for (var i = 0, l = $scope.pageList.length; i < l ; i += 1 ) {
            if ($scope.pageList[i].checked) {
                $scope.selectedNum += 1;
            }
        }
        if ($scope.selectedNum > 0) {
            $scope.isDeselectBtnShow = true;
            $scope.isDeleteBtnShow = true;
        } else {
            $scope.isDeselectBtnShow = false;
            $scope.isDeleteBtnShow = false;
        }
    }

    function showLoadMore() {
        
        //当前显示的联系人列表长度
        var pl = $scope.pageList.length;
        var sl = G_searchList.length;
        var l = G_list.length;
        if ($scope.searchText) {
            if (pl < sl) {
                $scope.isLoadMoreBtnShow = true;
                return;
            }
        } else {
            if (pl < l) {
                $scope.isLoadMoreBtnShow = true;
                return; 
            }
        }
        $scope.isLoadMoreBtnShow = false;
    }

    $scope.sendMessageTo = function(phoneNum , display_name) {
        $location.path('/messages').search({
            create: encodeURI(phoneNum)  + ',' + encodeURI(display_name)
        });
    };

    function goToListTop() {
        $('ul.contacts-list')[0].scrollTop = 0;
    }

    //主函数开始
    //联系人展示和编辑区域
    $scope.isContactsEditShow = false;
    $scope.isLeftLoadingShow = true;
    $scope.isRightLoadShow = true;
    $scope.isLoadMoreBtnShow = false;
    $scope.isListLoadShow = false;
    $scope.isPhotoUploadShow = false;
    $scope.isNoContactsShow = false;
    $scope.isDeselectBtnShow = false;
    $scope.isDeleteBtnShow = false;
    $scope.isEditBtnShow = true;
    $scope.isDelBtnShow = true;
    $scope.isSaveBtnShow = false;
    $scope.isCancelBtnShow = false;
    $scope.isNewContactDisable = true;
    $scope.isSendMessageShow = false;
    $scope.isNoneContacts = false;
    
    //当前的状态，“show” 正在显示某个联系人；“edit” 正在编辑；“new” 正在新建；这个状态也会用于检测“用户是否处于编辑状态突然点了旁边的联系人”。
    $scope.currentStatus = 'show';

    //被选中的数量
    $scope.selectedNum = 0;

    //用于版本检测
    $scope.serverMatchRequirement = $route.current.locals.versionSupport;
    $scope.pageList = G_pageList;
    $scope.typeMap = G_typeMap;
    $scope.protocolMap = G_protocol;
    $scope.showContacts = showContacts;

    wdKey.$apply('up', 'contacts', function() {
        var i, l;
        for (i = 0 , l = G_pageList.length ; i < l ; i += 1 ) {
            if ( (i - 1 >= 0) && G_pageList[i].clicked ) {
                showContacts(G_pageList[i-1].id);
                $scope.$broadcast('wdc:intoView');
                return false;
            }
        }
        for (i = 0 , l = G_searchList.length ; i < l ; i += 1 ) {
            if ( (i - 1 >= 0) && G_searchList[i].clicked ) {
                showContacts(G_searchList[i-1].id);
                $scope.$broadcast('wdc:intoView');
                return false;
            }
        }
    });

    wdKey.$apply('down', 'contacts', function() {
        var i, l;
        for (i = 0 , l = G_pageList.length ; i < l ; i += 1 ) {
            if ( (i + 1 < l) && G_pageList[i].clicked ) {
                showContacts(G_pageList[i+1].id);
                $scope.$broadcast('wdc:intoView');
                return false;
            }
        }
        for (i = 0 , l = G_searchList.length ; i < l ; i += 1 ) {
            if ( (i + 1 < l) && G_searchList[i].clicked) {
                showContacts(G_searchList[i+1].id);
                $scope.$broadcast('wdc:intoView');
                return false;
            }
        }
    });

    $scope.$on('$destroy', function() {
        if (!!G_keyContact) {
            G_keyContact.done();
        }
        wdKey.deleteScope('contacts');
    });

    init();
//return的最后括号
}];
});
