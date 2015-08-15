var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var connect = require('gulp-connect');

var concat = require('gulp-concat');

// Load all gulp plugins automatically
// and attach them to the `plugins` object
var plugins = require('gulp-load-plugins')();

// Temporary solution until gulp 4
// https://github.com/gulpjs/gulp/issues/355
var runSequence = require('run-sequence');

var pkg = require('./package.json');
var dirs = pkg['configs'].directories;

// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('archive:create_archive_dir', function () {
  fs.mkdirSync(path.resolve(dirs.archive), '0755');
});

gulp.task('archive:zip', function (done) {

  var archiveName = path.resolve(dirs.archive, pkg.name + '_v' + pkg.version + '.zip');
  var archiver = require('archiver')('zip');
  var files = require('glob').sync('**/*.*', {
    'cwd': dirs.dist,
    'dot': true // include hidden files
  });
  var output = fs.createWriteStream(archiveName);

  archiver.on('error', function (error) {
    done();
    throw error;
  });

  output.on('close', done);

  files.forEach(function (file) {

    var filePath = path.resolve(dirs.dist, file);

    // `archiver.bulk` does not maintain the file
    // permissions, so we need to add files individually
    archiver.append(fs.createReadStream(filePath), {
      'name': file,
      'mode': fs.statSync(filePath)
    });

  });

  archiver.pipe(output);
  archiver.finalize();

});

gulp.task('clean', function (done) {
  require('del')([
    dirs.archive,
    dirs.dist
  ], done);
});

gulp.task('copy', [
  'copy:.htaccess',
  'copy:index.html',
  'copy:jquery',
  'copy:license',
  'copy:main.css',
  'copy:misc',
  'copy:normalize'
]);

gulp.task('copy:.htaccess', function () {
  return gulp.src('node_modules/apache-server-configs/dist/.htaccess')
      .pipe(plugins.replace(/# ErrorDocument/g, 'ErrorDocument'))
      .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:index.html', function () {
  return gulp.src(dirs.src + '/index.html')
      .pipe(plugins.replace(/{{JQUERY_VERSION}}/g, pkg.devDependencies.jquery))
      .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:jquery', function () {
  return gulp.src(['node_modules/jquery/dist/jquery.min.js'])
      .pipe(plugins.rename('jquery-' + pkg.devDependencies.jquery + '.min.js'))
      .pipe(gulp.dest(dirs.dist + '/js/vendor'));
});

gulp.task('copy:license', function () {
  return gulp.src('LICENSE.txt')
      .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:main.css', function () {

  var banner = '/*! HTML5 Boilerplate v' + pkg.version +
      ' | ' + pkg.license.type + ' License' +
      ' | ' + pkg.homepage + ' */\n\n';

  return gulp.src(dirs.src + '/css/main.css')
      .pipe(plugins.header(banner))
      .pipe(plugins.autoprefixer({
        browsers: ['last 2 versions', 'ie >= 8', '> 1%'],
        cascade : false
      }))
      .pipe(gulp.dest(dirs.dist + '/css'));
});

gulp.task('copy:misc', function () {
  return gulp.src([

    // Copy all files
    dirs.src + '/**/*',

    // Exclude the following files
    // (other tasks will handle the copying of these files)
    '!' + dirs.src + '/**/*.ts',
    '!' + dirs.src + '/css/main.css',
    '!' + dirs.src + '/index.html'

  ], {

    // Include hidden files by default
    dot: true

  }).pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:normalize', function () {
  return gulp.src('node_modules/normalize.css/normalize.css')
      .pipe(gulp.dest(dirs.dist + '/css'));
});

gulp.task('lint:js', function () {
  return gulp.src([
    'gulpfile.js',
    dirs.src + '/js/*.js',
    dirs.test + '/*.js'
  ]).pipe(plugins.jscs())
      .pipe(plugins.jshint())
      .pipe(plugins.jshint.reporter('jshint-stylish'))
      .pipe(plugins.jshint.reporter('fail'));
});

gulp.task('typescript', function (done) {
  var tsResult = gulp.src(dirs.src + '/scripts/**/*.ts')
      .pipe(plugins.sourcemaps.init())
      .pipe(plugins.typescript({
        declarationFiles : true,
        noExternalResolve: true,
        sortOutput       : true,
        //sourceRoot       : dirs.src + '../scripts'
      }));


  if (tsResult.js) {
    return tsResult.js
      //.pipe(concat('main.js'))
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(dirs.dist + '/js'));
  } else {
    done();
  }
});

gulp.task('vendor', function () {
  return gulp.src([
    'node_modules/immutable/dist/immutable.js'
  ])
      .pipe(concat('vendor.js'))
      .pipe(gulp.dest(dirs.dist + '/js/'));
});

gulp.task('watch', function () {
  return gulp.watch(dirs.src + '/**/*.*', ['build'])

});

// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------

gulp.task('server', function () {
  connect.server({
    port      : 7777,
    root      : [dirs.dist],
    livereload: true
  });
});

gulp.task('archive', function (done) {
  runSequence(
      'build',
      'archive:create_archive_dir',
      'archive:zip',
      done);
});

gulp.task('build', function (done) {
  runSequence(
      ['clean'],
      'vendor',
      'typescript',
      'copy',
      done);
});


gulp.task('default', ['build', 'server', 'watch']);
