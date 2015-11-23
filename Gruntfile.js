module.exports = function (grunt)
{
  grunt.initConfig ({

    'angular-builder': {
      options: {
        mainModule: 'morseTrainer'
      },
      app: {
        src:  'app/**/*.js',
        dest: 'build/project.js'
      }
    }

  });

  grunt.loadNpmTasks ('grunt-angular-builder');
  grunt.loadNpmTasks('grunt-contrib-uglify');


  grunt.registerTask ('release', ['angular-builder']);
  grunt.registerTask ('debug', ['angular-builder::debug']);

};
