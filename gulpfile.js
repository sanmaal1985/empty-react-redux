var gulp = require('gulp'),
    myth = require('gulp-myth'),
    concat = require('gulp-concat'),
    includeHtml = require('gulp-include-html'),
    less = require('gulp-less'),
    path = require('path'),
    watch = require('gulp-watch'),
    connect = require('gulp-connect'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    watchify = require ('watchify'),
    batch = require('gulp-batch'),
    babelify     = require('babelify');
//Build JS
gulp.task('scripts', function(){
    var cb = browserify({
        entries: ['./assets/js/app.jsx'], // Only need initial file, browserify finds the deps
        debug: true, // Gives us sourcemapping
        cache: {}, packageCache: {}, fullPaths: true,
        extensions: ['.jsx', '.js'],
        plugin: [watchify]
    });
    var rebundle = function(){
        cb.transform(babelify.configure());
        cb.bundle()
            .pipe(source('main.js'))
            .pipe(gulp.dest('./build/js/'))
            .pipe(connect.reload());
    };
    cb.on('update', rebundle);
    rebundle();
});
// Build pages
gulp.task('pages', function() {
    gulp.src('./assets/tmpl/*.html')
        .pipe(watch('./assets/tmpl/*.html'))
        .pipe(includeHtml())
        .pipe(gulp.dest('build/'))
        .pipe(connect.reload());
});
// CSS
gulp.task('css', function() {
    gulp.src('./assets/css/**/*.less')
        .pipe(watch('./assets/css/**/*.less'))
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(myth())
        .pipe(gulp.dest('./build/css/'))
        .pipe(connect.reload());
});
//Start web-server
gulp.task('connect', function(){
    connect.server({
        port: 9999,
        fallback: './build/index.html',
        root: 'build',
        livereload: true
    });
});

gulp.task('watch', ['connect', 'build']);

gulp.task('build', ['pages', 'css', 'scripts']);
