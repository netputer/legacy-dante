require.config({
    shim: {
        'underscore': {
            exports: '_'
        },
        'facebook' : {
            exports : 'FB'
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
        // prefix
        templates: '../templates',
        // facebook
        facebook : 'http://connect.facebook.net/en_US/all'
    }
});

require(['app'], function() {});
