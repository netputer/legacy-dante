// Generated on 2013-05-29 using generator-webapp 0.2.2
/*jshint node:true*/
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
    'use strict';
    return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
    'use strict';
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'dist',
        tmp: '.tmp'
    };

    grunt.initConfig({
        yeoman: yeomanConfig,
        watch: {
            coffee: {
                files: ['<%= yeoman.app %>/scripts/{,*/}*.coffee'],
                tasks: ['coffee:dist']
            },
            compass: {
                files: ['<%= yeoman.app %>/styles/**/*.scss'],
                tasks: ['compass:server']
            },
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    '<%= yeoman.app %>/*.html',
                    'Gruntfile.js',
                    '<%= yeoman.tmp %>/styles/*.css',
                    '<%= yeoman.app %>/scripts/**/*.js',
                    '<%= yeoman.app %>/templates/**/*.html'
                ]
            }
        },
        connect: {
            options: {
                port: 3501,
                // change this to '0.0.0.0' to access the server from outside
                hostname: '0.0.0.0'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, yeomanConfig.app)
                        ];
                    }
                }
            },
            test: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, 'test')
                        ];
                    }
                }
            },
            dist: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, yeomanConfig.dist)
                        ];
                    }
                }
            }
        },
        open: {
            server: {
                path: 'http://localhost:<%= connect.options.port %>'
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                '<%= yeoman.app %>/scripts/**/*.js',
                '!<%= yeoman.app %>/scripts/vendor/**/*'
            ]
        },
        coffee: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/scripts',
                    src: '{,*/}*.coffee',
                    dest: '.tmp/scripts',
                    ext: '.js'
                }]
            },
            test: {
                files: [{
                    expand: true,
                    cwd: 'test/spec',
                    src: '{,*/}*.coffee',
                    dest: '.tmp/spec',
                    ext: '.js'
                }]
            }
        },
        compass: {
            options: {
                sassDir: '<%= yeoman.app %>/styles',
                cssDir: '.tmp/styles',
                generatedImagesDir: '.tmp/images/generated',
                imagesDir: '<%= yeoman.app %>/images',
                javascriptsDir: '<%= yeoman.app %>/scripts',
                fontsDir: '<%= yeoman.app %>/styles/fonts',
                importPath: '<%= yeoman.app %>/components',
                httpImagesPath: '../images',
                httpGeneratedImagesPath: '../images/generated',
                relativeAssets: false
            },
            dist: {},
            server: {
                options: {
                    // debugInfo: true
                }
            }
        },
        requirejs: {
            options: {
                almond: true,
                replaceRequireScript: [{
                    files: [yeomanConfig.dist + '/index.html'],
                    module: 'main'
                }],

                appDir: yeomanConfig.app + '/scripts',
                baseUrl: './',
                dir: yeomanConfig.tmp + '/scripts',
                mainConfigFile: yeomanConfig.app + '/scripts/main.js',
                modules: [{name: 'main'}],
                optimize: 'none',
                preserveLicenseComments: false,
                useStrict: true
            },
            dist: {},
            cloud: {
                options: {
                    pragmas: {
                        cloudBased: true
                    }
                }
            }
        },
        uglify: {
            options: {
                preserveComments: 'some'
            },
            dist: {
                files: [{
                    src: ['<%= yeoman.tmp %>/scripts/main.js'],
                    dest: '<%= yeoman.dist %>/scripts/main.js'
                }]
            }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= yeoman.dist %>/scripts/{,*/}*.js',
                        '<%= yeoman.dist %>/styles/{,*/}*.css',
                        '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
                        '<%= yeoman.dist %>/styles/fonts/*'
                    ]
                }
            }
        },
        useminPrepare: {
            options: {
                dest: '<%= yeoman.dist %>'
            },
            html: '<%= yeoman.app %>/index.html'
        },
        usemin: {
            options: {
                dirs: ['<%= yeoman.dist %>']
            },
            html: ['<%= yeoman.dist %>/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/styles/{,*/}*.css']
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images/isolate',
                    src: '{,*/}*.{png,jpg,jpeg}',
                    dest: '<%= yeoman.dist %>/images/isolate'
                }, {
                    expand: true,
                    cwd: '<%= compass.options.generatedImagesDir %>',
                    src: '{,*/}*.{png,jpg,jpeg}',
                    dest: '<%= yeoman.dist %>/images/generated'
                }]
            }
        },
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        cssmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.tmp %>',
                    dest: '<%= yeoman.tmp %>',
                    src: ['**/*.css'],
                    filter: 'isFile'
                }]
            }
        },
        htmlmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    src: '*.html',
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        targethtml: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.dist %>',
                    src: '*.html',
                    dest: '<%= yeoman.dist %>'
                }]
            },
            cloud: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.dist %>',
                    src: '*.html',
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        replace: {
            cdn: {
                src: ['<%= yeoman.dist %>/index.html'],
                dest: ['<%= yeoman.dist %>/index.html'],
                replacements: [
                    {
                        from: /<script(.+)src=['"]([^"']+)["']/gm,
                        to: '<script$1src="http://s.wdjimg.com/me/$2"'
                    },
                    {
                        from: /<link([^\>])+href=['"]([^"']+)["']/gm,
                        to: '<link$1href="http://s.wdjimg.com/me/$2"'
                    }
                ]
            }
        },
        // Put files not handled in other tasks here
        copy: {
            tmp: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.tmp %>',
                    src: [
                        'styles/{,*/}*.css',
                        'components/{,*/}*.css'
                    ]
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,txt}',
                        '.htaccess',
                        'images/{,*/}*.{webp,gif}',
                        'styles/fonts/*'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/images',
                    dest: '<%= yeoman.dist %>/images',
                    src: [
                        'generated/*'
                    ]
                }]
            }
        },
        concurrent: {
            server: [
                'coffee:dist',
                'compass:server'
            ],
            test: [
                'coffee',
                'compass'
            ],
            dist: [
                'coffee',
                // 'compass:dist',
                'imagemin',
                'svgmin',
                'htmlmin'
            ]
        },
        bower: {
            options: {
                exclude: ['modernizr']
            },
            all: {
                rjsConfig: '<%= yeoman.app %>/scripts/main.js'
            }
        },
        shell: {
            bootstrap_build: {
                command: 'make bootstrap',
                options: {
                    execOptions: {
                        cwd: 'bootstrap'
                    }
                }
            },
            bootstrap_copy: {
                command: 'cp bootstrap/bootstrap/img/* app/images/; cp bootstrap/bootstrap/css/bootstrap.css app/styles/bootstrap.css; cp bootstrap/bootstrap/css/bootstrap-responsive.css app/styles/bootstrap-responsive.css'
            },
            bootstrap_clean: {
                command: 'make clean',
                options: {
                    execOptions: {
                        cwd: 'bootstrap'
                    }
                }
            }
        }
    });

    grunt.registerTask('server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build:dist', 'open', 'connect:dist:keepalive']);
        }

        if (target === 'cloud') {
            return grunt.task.run(['build:cloud', 'open', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            // 'clean:server',
            'concurrent:server',
            'connect:livereload',
            // 'open',
            'watch'
        ]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'concurrent:test',
        'connect:test'
    ]);

    grunt.registerTask('build', function(target) {
        if (target === 'cloud') {
            return grunt.task.run([
                'clean:dist',
                'useminPrepare',
                'compass:dist',
                'concurrent:dist',
                'requirejs:cloud',
                'copy:tmp',
                'cssmin',
                'concat',
                'uglify',
                'copy:dist',
                'rev',
                'usemin',
                'targethtml:cloud',
                'replace:cdn'
            ]);
        }

        return grunt.task.run([
            'clean:dist',
            'useminPrepare',
            'compass:dist',
            'concurrent:dist',
            'requirejs:dist',
            'copy:tmp',
            'cssmin',
            'concat',
            'uglify',
            'copy:dist',
            'rev',
            'usemin',
            'targethtml:dist'
        ]);
    });

    grunt.registerTask('default', [
        'jshint',
        // 'test',
        'build'
    ]);
};
