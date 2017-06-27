'use strict';
// Dependences
const gulp = require('gulp'),
  less = require('gulp-less'),
  sourcemaps = require('gulp-sourcemaps'),
  autoprefixer = require('gulp-autoprefixer'),
  rigger = require('gulp-rigger'),
  browserSync = require('browser-sync').create(),
  reload = browserSync.reload;

  // Paths
var path = {
  dis: {
    html: 'dis/',
    css: 'dis/style/',
    js: 'dis/js/',
  },
  src: {
    html: 'src/**/*.html',
    css: 'src/style/**/*.less',
    js: 'src/js/*.js',
  },
  watch: {
    html: 'src/**/*.html',
    js: 'src/js/**/*.*',
    style: 'src/style/**/*.*',
  }
};

// gulp tasks
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: path.dis.html
        },
        tunnel: true,
        host: 'localhost',
        port: 8040,
        logPrefix: 'happiness'
    });
});

// html
gulp.task('html', function() {
   gulp.src(path.src.html)
        .pipe(gulp.dest(path.dis.html));
});

// less to css
gulp.task('less', function () {
  return gulp.src(path.src.css)
  .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: true
      }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.dis.css));
});

// concat js
gulp.task('js', function(){
  return gulp.src(path.src.js)
    .pipe(rigger())
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.dis.js))
});

// watch
gulp.task('watch', function () {
  gulp.watch([path.watch.html], ['html']);
  gulp.watch([path.watch.style], ['less']);
  gulp.watch([path.watch.js], ['js']);
  gulp.watch(path.dis.html).on('change', reload);
});

gulp.task('build', [
    'html',
    'less',
    'js'
]);

gulp.task('default', ['build', 'watch', 'browserSync']);