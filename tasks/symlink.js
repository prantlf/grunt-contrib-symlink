/*
 * grunt-contrib-symlink
 * https://github.com/gruntjs/grunt-contrib-symlink
 *
 * Copyright (c) 2015 Grunt Team
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var fs = require('fs');
  var path = require('path');

  grunt.registerMultiTask('symlink', 'Create symbolic links.', function() {
    var nowrite = grunt.option('no-write');
    var linkCount = 0;

    // default options
    var options = this.options({
      overwrite: false,
      force: false,
      dirmode: 'dir'
    });

    // overwrite options from CLI
    options.overwrite = grunt.option('overwrite') || options.overwrite;
    options.dirmode = grunt.option('dirmode') || options.dirmode;

    // force options from CLI
    options.force = grunt.option('force') || options.force;

    this.files.forEach(function(f) {
      // The symlink mode is determined semi-automatically.
      var mode = grunt.file.isDir(f.src[0]) ? f.dirmode || options.dirmode : 'file';
      var srcpath = mode === 'junction' ? path.resolve(f.src[0]) : f.src[0];
      var destpath = f.dest;
      if (!grunt.file.exists(srcpath)) {
        grunt.log.warn('Source file "' + srcpath + '" not found.');
        return;
      } else if (grunt.file.exists(destpath)) {
        if (!options.overwrite) {
          grunt.log.warn('Destination ' + destpath + ' already exists.');
          return;
        }
        grunt.file.delete(destpath, {force: options.force});
      }
      // Strip any trailing slashes.
      destpath = destpath.replace(/[\\\/]$/, '');
      // The destdir is the location in which the symlink will be created.
      var destdir = path.join(destpath, '..');
      // If the dest path is relative, create a proper relative symlink path.
      if (!grunt.file.isPathAbsolute(srcpath)) {
        srcpath = path.relative(destdir, srcpath) || '.';
      }
      // Create any necessary interim directories.
      grunt.file.mkdir(destdir);
      grunt.verbose.write((nowrite ? 'Not actually linking ' : 'Linking ') + '(' + mode + ') ' + destpath + ' -> ' + srcpath + '...');
      try {
        if (!nowrite) {
          fs.symlinkSync(srcpath, destpath, mode);
        }
        grunt.verbose.ok();
      } catch(e) {
        grunt.verbose.error();
        grunt.log.error(e);
        grunt.fail.warn('Failed to create symlink: ' + '(' + mode + ') ' + destpath + ' -> ' + srcpath + '.');
      }
      linkCount++;
    });
    grunt.log.ok('Created ' + linkCount + ' symbolic links.');
  });

};
