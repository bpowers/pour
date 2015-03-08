module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: '<json:package.json>',
        watch: {
            default: {
                options: {
                    spawn: false,
                    interrupt: true
                },
                files: ['www/bower_components/**/*.html', 'www/index.html'],
                tasks: ['vulcanize']
            }
        },
        vulcanize: {
            default: {
                options: {
                    csp: true,
                    inline: true,
                    strip: true
                },
                files: {
                    'www/build.html': 'www/index.html'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-vulcanize');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task.
    grunt.registerTask('default', ['vulcanize', 'watch']);

};