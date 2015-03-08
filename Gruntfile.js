/*global module, require, console*/

module.exports = function (grunt) {
    'use strict';

    // load grunt-jslint;
    grunt.loadNpmTasks('grunt-jslint');

    //load the rest
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            js: {
                files: ['app.js', 'routes/*.js', 'bin/*', 'database/*.js', 'public/javascripts/*.js', 'Gruntfile.js'],
                tasks: ['jslint']
            }
        },
        //jslint
        jslint: {
            build: {
                // files to lint
                src: [
                    'app.js', 'routes/*.js', 'bin/*', 'database/*.js', 'public/javascripts/*.js', 'Gruntfile.js'
                ],
                // see https://hci.ecs.soton.ac.uk/wiki/NodejsReferences
                directives: {
                    node: true,
                    devel: true,
                    sloppy: true,
                    unparam: true,
                    nomen: true
                    //white: false
                }
            }
        }
    });

    grunt.registerTask('default', []);

};
