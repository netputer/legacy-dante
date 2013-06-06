define([
    'underscore',
    'angular'
], function(
    _,
    angular
) {
'use strict';
var popover = ['$document', '$window', function($document, $window) {

    var viewport = angular.element($window);

    function Popmenu(options) {
        this.options = options || {};
        _.defaults(this.options, {
            element: null,
            getRefEl: function() {},
            distance: 5,
            placement: 'bottom',
        });

        this.element = options.element;
        this.getRefEl = options.getRefEl;
        this.cueEl = this.element.children('i');
        this.contentEl = this.element.children('div:last-of-type');
        this.handleOutsideClick = this.close.bind(this);

        this.element.on('click', function(e) {
            e.stopPropagation();
        });
    }

    _.extend(Popmenu.prototype, {
        open: function() {
            if (this.element.is(':visible')) { return; }
            var handleOutsideClick = this.handleOutsideClick;
            _.defer(function() {
                $document.one('click', handleOutsideClick);
            });
            this.element.show();
            this.updateDimensions();
            this.updatePosition();
            this.updateCuePosition();
        },
        close: function() {
            $document.off('click', this.handleOutsideClick);
            this.element.hide();
        },
        getViewportDimensions: function() {
            return {
                width: viewport.width(),
                height: viewport.height(),
                left: viewport.scrollLeft(),
                top: viewport.scrollTop()
            };
        },
        getDimensions: function(element) {
            var offset = element.offset();
            var width = element.outerWidth();
            var height = element.outerHeight();

            return {
                width: width,
                height: height,
                top: offset.top,
                bottom: offset.top + height,
                left: offset.left,
                right: offset.left + width
            };
        },
        updateDimensions: function() {
            // adjust dimensions according to content
            var contentDimensions = this.getDimensions(this.contentEl);
            this.element.width(Math.max(contentDimensions.width, 100));
            this.element.height(Math.max(contentDimensions.height, 100));
        },
        updateCuePosition: function() {
            // adjust cue's position
            var dimensions = this.getDimensions(this.element);
            var refDimensions = this.getDimensions(this.getRefEl());
            var mainAxis = this.decideMainAxis(this.options.placement);

            var left, top;
            if (mainAxis === 'x') {
                left = this.adjustSubAxis((refDimensions.left + refDimensions.right) / 2, 10, dimensions.left + 4, dimensions.right - 4);
                this.cueEl.css('left', left);
            }
            else {
                top = this.adjustSubAxis((refDimensions.top + refDimensions.bottom) / 2, 10, dimensions.top + 4, dimensions.bottom - 4);
                this.cueEl.css('top', top - dimensions.top);
            }
        },
        updatePosition: function() {
            // adjust position in viewport
            var dimensions = this.getDimensions(this.element);
            var viewportDimensions = this.getViewportDimensions();
            var refDimensions = this.getDimensions(this.getRefEl());
            var mainAxis = this.decideMainAxis(this.options.placement);

            var left, top;
            if (mainAxis === 'x') {
                left = this.adjustSubAxis((refDimensions.left + refDimensions.right) / 2, dimensions.width, 5, viewportDimensions.width - 5);
                top = this.options.placement === 'bottom' ?
                        refDimensions.bottom + 5 :
                        refDimensions.top - dimensions.height - 5;
            }
            else {
                top = this.adjustSubAxis((refDimensions.top + refDimensions.bottom) / 2, dimensions.height, 5, viewportDimensions.height - 5);
                left = this.options.placement === 'right' ?
                        refDimensions.right + 5 :
                        refDimensions.left - dimensions.width - 5;
            }

            top += viewportDimensions.top;
            left += viewportDimensions.left;

            this.element.offset({
                left: left,
                top: top
            });
        },
        decideMainAxis: function(placement) {
            switch (placement) {
                case 'left':
                case 'right':
                    return 'y';
                case 'top':
                case 'bottom':
                    return 'x';
                default:
                    return 'x';
            }
        },
        adjustSubAxis: function(refCenter, elementLength, minLimit, maxLimit) {
            var point;
            point = Math.max(refCenter - elementLength / 2, minLimit);
            point = Math.min(refCenter + elementLength / 2, maxLimit) - elementLength / 2;
            return Math.max(point - elementLength / 2, minLimit);
        },
        adjustMainAxis: function() {}
    });

    return {
        restrict: 'EAC',
        template: '<i><i></i></i><span class="wd-loading wd-loading-local" data-visible="true"></span><div ng-transclude></div>',
        transclude: true,
        require: '^wdMenu',
        link: function($scope, $element, $attrs, controller) {
            var popmenu = new Popmenu({
                element: $element,
                getRefEl: function() {
                    if (!controller.triggerEl) {
                        throw new Error('wdPopmenu needs a trigger!');
                    }
                    return controller.triggerEl;
                },
                placement: $attrs.placement || 'bottom'
            });

            popmenu.close();

            $scope.$watch($attrs.loading, function(value) {
                $element.children('.wd-loading').toggle(value);
                $scope.$evalAsync(function() {
                    popmenu.updateDimensions();
                    popmenu.updatePosition();
                    popmenu.updateCuePosition();

                });
            });

            controller.popover = popmenu;
        }
    };
}];

var menu = [function() {
    return {
        controller: [function() {
            this.triggerEl = null;
            this.popover = null;

            this.open = function() {
                if (this.popover) {
                    this.popover.open();
                }
            };

            this.close = function() {
                if (this.popover) {
                    this.popover.close();
                }
            };
        }],
        link: function() {}
    };
}];


var trigger = [function() {
    return {
        require: '^wdMenu',
        link: function($scope, $element, $attrs, controller) {
            var events = $attrs.events || 'click';
            $element.on(events, function(e) {
                controller.open();
            });

            controller.triggerEl = $element;
        }
    };
}];

var menuItem = [function() {
    return {
        require: '^wdMenu',
        link: function($scope, $element, $attrs, controller) {
            $element.on('click', function(e) {
                if (!e.isDefaultPrevented()) {
                    controller.close();
                }
            });
        }
    };
}];

return {
    Menu: menu,
    Popover: popover,
    Trigger: trigger,
    MenuItem: menuItem
};

});
