define([
    'angular',
    'common/directives/loading',
    'common/directives/strip',
    'common/services/sharing',
    'common/services/dev',
    'common/services/viewport',
    'common/directives/autofocus',
    'common/services/key',
    'common/services/alert',
    'common/directives/alert',
    'common/services/keeper',
    'common/services/ga',
    'common/services/notification',
    'common/directives/notification',
    'common/services/browser',
    'common/bootstrap',
    'common/directives/blank',
    'common/directives/upgrade-warning',
    'common/services/title-notification',
    'common/directives/navbar',
    'common/services/emitter',
    'common/services/socket',
    'common/services/share',
    'common/directives/auto-stretch-textarea',
    'common/directives/temporary-disabled',
    'common/directives/sidebar',
    'common/services/db',
    'common/directives/nav-item',
    'common/services/desktop-notification',
    'common/services/window-focus',
    'common/directives/scroll-detect',
    'common/services/communicate-snappea-com',
    'common/services/user-settings',
    'common/filters/html-linky',
    'common/services/reminder',
    'common/directives/reminder',
    'common/filters/size-format',
    'common/filters/wrap-remote-connection-url',
    'common/filters/trust-as-html',
    'common/services/download'
], function(
    angular,
    loading,
    strip,
    sharing,
    dev,
    viewport,
    autofocus,
    key,
    alert,
    alertDirecitve,
    keeper,
    ga,
    notification,
    notificationDirective,
    browser,
    bootstrap,
    blankDirective,
    upgradeWarningDirective,
    titleNotification,
    navbar,
    emitter,
    socket,
    share,
    autoStretchTextarea,
    temporaryDisabled,
    sidebar,
    db,
    navItem,
    desktopNotification,
    windowFocus,
    scrollDetect,
    communicateSnappeaCom,
    userSettings,
    htmlLinky,
    reminder,
    reminderDirective,
    sizeFormat,
    wrapRemoteConnectionURL,
    trustAsHtml,
    download
) {
// jshint unused:false
'use strict';
// Common Module is the collection of most used or global functions.
angular.module('wdCommon', ['wdBootstrap', 'ui', 'monospaced.elastic'])
    // Directives
    .directive('wdAutoFocus', autofocus)
    .directive('wdAutoStretchTextarea', autoStretchTextarea)
    .directive('wdNavbar', navbar)
    .directive('wdNavItem', navItem)
    .directive('wdStrip', strip)
    .directive('wdLoading', loading)
    .directive('wdAlert', alertDirecitve)
    .directive('wdNotification', notificationDirective)
    .directive('wdBlank', blankDirective)
    .directive('wdUpgradeWarning', upgradeWarningDirective)
    .directive('wdTemporaryDisabled', temporaryDisabled)
    .directive('wdSidebar', sidebar)
    .directive('wdScrollDetect', scrollDetect)
    .directive('wdReminder', reminderDirective)
    // Services
    .provider('wdDev', dev)
    .provider('wdEventEmitter', emitter)
    .provider('wdDownload', download)
    .factory('wdSocket', socket)
    .factory('wdBrowser', browser)
    .factory('wdViewport', viewport)
    .factory('wdShare', share)
    .factory('wdSharing', sharing)
    .factory('wdKey', key)
    .factory('wdAlert', alert)
    .factory('wdKeeper', keeper)
    .factory('GA', ga)
    .factory('wdNotification', notification)
    .factory('wdTitleNotification', titleNotification)
    .factory('wdDesktopNotification', desktopNotification)
    .factory('wdWindowFocus', windowFocus)
    .factory('wdDatabase', db)
    .factory('wdCommunicateSnappeaCom', communicateSnappeaCom)
    .factory('wdUserSettings', userSettings)
    .factory('wdReminder', reminder)
    // filters
    .filter('htmlLinky', htmlLinky)
    .filter('sizeFormat', sizeFormat)
    .filter('wrapRemoteConnectionURL', wrapRemoteConnectionURL)
    .filter('trustAsHtml', trustAsHtml);
});
