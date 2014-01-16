define([
        'text!templates/common/reminder.html'
    ], function(template) {
'use strict';
return [function() {
    var noop = function() {};
    return {
        restrict: 'A',
        scope: {},
        template: template,
        replace: true,
        controller: ['wdReminder', '$scope', '$q', '$attrs', '$element',
        function(wdReminder, $scope, $q, $attrs, $element) {
            $scope.toggle = false;
            $scope.ok = noop;
            $scope.cancel = noop;
            $scope.header = '';
            $scope.content = '';
            $scope.helpLink = '';
            $scope.helpText = '';

            wdReminder.registerModal({
                create: function(options) {
                    options = options || {};
                    var deferred = $q.defer();

                    $scope.header = options.header;
                    $scope.content = options.content;
                    $scope.okText = options.ok;
                    $scope.disabled = options.disabledButton;

                    if (options.help) {
                        $scope.helpLink = options.help.link;
                        $scope.helpText = options.help.text;
                    }
                    $scope.toggle = true;

                    $scope.ok = function() {
                        $scope.toggle = !options.clickToHide;
                        deferred.resolve();
                    };
                    $scope.cancel = function() {
                        $scope.toggle = false;
                        deferred.reject();
                    };

                    return deferred.promise;
                },
                destory: function() {
                    var deferred = $q.defer();
                    $scope.toggle = false;
                    deferred.resolve();

                    return deferred.promise;   
                }
            });
        }]
    };
}];
});
