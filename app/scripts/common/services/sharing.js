define([], function() {
'use strict';
return ['$window', '$rootScope', function($window, $rootScope) {
    var content = $rootScope.DICT.app.SHARE_TEXT;

    return {
        weibo: function(photo) {
            $window.open('http://service.weibo.com/share/share.php?appkey=1483181040&relateUid=1727978503&title='+ encodeURIComponent(content) +'&url=&pic='+encodeURIComponent(photo.path),'newwindow','height=500, width=400');
        },

        qzone: function(photo) {
            var url = 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?title=' + 
                encodeURIComponent(content) + '&summary=' + encodeURIComponent(' ') + 
                '&url=' + encodeURIComponent('http://www.wandoujia.com/cloud') + '&pics=' + encodeURIComponent(photo.path);

            $window.open(url, 'newwindow','height=500, width=400');
        }
    };
}];
});
