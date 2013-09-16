define([], function() {
'use strict';
return ['$q', function($q) {
    return {
        link: function($scope, $element, $attrs) {
            var blocking = false;

            $element.on('scroll', function(e) {
                if (blocking) {
                    return;
                }
                var elHeight = $element.height();
                var elScrollTop = $element.scrollTop();
                var contentHeight = $element.children().outerHeight();

                if (elScrollTop + elHeight + 10 >= contentHeight) {
                    blocking = true;
                    if ($attrs.bottom) {
                        $scope.$apply(function() {
                            $q.when($scope.$eval($attrs.bottom)).then(function() {
                                blocking = false;
                            }, function() {
                                $attrs.$set('bottom', null);
                            });
                        });
                    }
                    else {
                        blocking = false;
                    }
                }
            });
        }
    };
}];
});
