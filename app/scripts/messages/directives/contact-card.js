define([
    'text!templates/messages/contact-card.html'
], function(
    template
) {
'use strict';
return ['$compile', '$window', '$rootScope', '$location',
function($compile,   $window,   $rootScope,   $location) {
    var CLASS_VISIBLE = 'wdm-contact-card-visible';
    var commonScope = $rootScope.$new();
    var card = null;

    var isVisible = false;
    var hideDelayTimer = null;

    function init() {
        if (!card) {
            card = $compile(template)(commonScope);
            card.appendTo($window.document.body);
            card.on('mouseenter', show);
            card.on('mouseleave', hide);
            isVisible = false;
        }
    }

    function show() {
        clearTimeout(hideDelayTimer);
        init();
        if (!isVisible) {
            card.addClass(CLASS_VISIBLE);
            isVisible = true;
        }
    }

    function hide() {
        clearTimeout(hideDelayTimer);
        if (isVisible) {
            hideDelayTimer = setTimeout(function() {
                card.removeClass(CLASS_VISIBLE);
                isVisible = false;
            }, 500);
        }
    }

    commonScope.addContact = function() {
        $location.path('/contacts').search('id', 'new');
        if (commonScope.contactAddress) {
            $location.path('/contacts').search('phone', commonScope.contactAddress);
        }
    };
    
    commonScope.viewContact = function() {
        $location.path('/contacts').search('id', commonScope.contactId);
    };

    commonScope.$on('$destroy', function() {
        hide();
        card.remove();
    });

    return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {
            $element.on('mouseenter', function() {
                $scope.$apply(function() {
                    commonScope.contactAvatar = $attrs.contactAvatar;
                    commonScope.contactName = $attrs.contactName;
                    commonScope.contactAddress = $attrs.contactAddress;
                    commonScope.contactId = $attrs.contactId;
                    if (!$attrs.contactId) {
                        commonScope.contactExisted = false;
                    } else {
                        commonScope.contactExisted = $attrs.contactId !== '-1';
                    }
                    // 云端版不显示
                    if ($rootScope.READ_ONLY_FLAG) {
                        return;
                    }
                    show();
                    var offset = $element.offset();
                    var width = $element.outerWidth();
                    var height = $element.outerHeight();
                    var cardWidth = card.outerWidth();
                    card.offset({
                        left: offset.left + width / 2 - cardWidth / 2,
                        top: offset.top + height + 10
                    });
                });
            });
            $element.on('mouseleave', hide);

            $element.on('$destroy', function() {
                hide();
            });
        }
    };
}];
});
