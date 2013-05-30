 require.config({
  shim: {
    'underscore': {
        exports: '_'
    }
  },
  locale: 'en_us',
  paths: {
    // lib
    jquery: 'vendor/jquery.wrapper',
    underscore: '../components/underscore/underscore',
    angular: 'vendor/angular/angular.wrapper',
    keymaster: 'vendor/keymaster.amd',
    bootstrap: 'vendor/bootstrap',
    fineuploader: 'vendor/fineuploader/fineuploader',
    moment: '../components/moment/moment',
    io: 'vendor/socket.io.wrapper',
    // requirejs plugins
    text: '../components/requirejs-text/text',
    i18n: '../components/requirejs-i18n/i18n',
    // prefix
    templates: '../templates'
  }
});

require(['app'], function() {});
