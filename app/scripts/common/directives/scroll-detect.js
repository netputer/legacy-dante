define([], function() {
'use strict';
return ['$q', function($q) {
    return {
        link: function($scope, $element, $attrs) {
            var blocking = false;

            $element.on('scroll', function(e) {
                var elScrollTop = $element.scrollTop();
                $scope.containerScrolled = elScrollTop > 0 ? true : false;

                if (blocking) {
                    return;
                }
                var elHeight = $element.height();
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
