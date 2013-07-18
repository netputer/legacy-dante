define([], function() {
'use strict';
return ['$window', function($window) {
    return {
        weibo: function(photo) {
            var content = '来自 @豌豆荚 云相册照片即时上传';
            $window.open('http://service.weibo.com/share/share.php?appkey=1483181040&relateUid=1727978503&title='+ encodeURIComponent(content) +'&url=&pic='+encodeURIComponent(photo.path),'newwindow','height=500, width=400');
        }
    };
}];
});
