var gulp = require('gulp'),
    myth = require('gulp-myth'),
    concat = require('gulp-concat'),
    includeHtml = require('gulp-include-html'),
    less = require('gulp-less'),
    copy = require('gulp-copy'),
    path = require('path'),
    watch = require('gulp-watch'),
    connect = require('gulp-connect'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    watchify = require ('watchify'),
    batch = require('gulp-batch'),
    babelify     = require('babelify'),
    argv = require('yargs').argv,
    streamify = require('gulp-streamify'),
    uglify = require('gulp-uglify'),
    gulpif = require('gulp-if'),
    sourcemaps = require('gulp-sourcemaps');

//Build JS
gulp.task('scripts', function(){
    var cb = browserify({
        entries: ['./src/js/app.jsx'],
        debug: true,
        cache: {},
        packageCache: {},
        fullPaths: true,
        extensions: ['.jsx', '.js'],
        plugin: [watchify]
    });
    var rebundle = function(){
        cb.transform(babelify);
        cb.bundle()
            .on('error', function(err) { console.error(err); this.emit('end'); })
            .pipe(source('main.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./build/js/'))
            .pipe(connect.reload());
    };
    cb.on('update', rebundle);
    rebundle();
});
// Build pages
gulp.task('pages', function() {
    gulp.src('./src/tmpl/*.html')
        .pipe(watch('./src/tmpl/*.html'))
        .pipe(includeHtml())
        .pipe(gulp.dest('build/'))
        .pipe(connect.reload());
});
//watch less
gulp.task('watch-less', function(){
    watch('./src/**/*.less', batch(function (events, done) {
        gulp.start('convert-less', done);
    }));
});

//convert LESS
gulp.task('convert-less', function() {
    gulp.src('./src/**/*.less')
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(myth())
        .pipe(concat("main.css"))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('build/css/'))
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

gulp.task('html', function() {
    gulp.src('./src/tmpl/*.html')
        .pipe(includeHtml())
        .pipe(gulp.dest('build/'));
});

gulp.task('js', function(){
    var cb = browserify({
        entries: ['./src/js/app.jsx'], // Only need initial file, browserify finds the deps
        debug: !argv.prod, // Gives us sourcemapping
        cache: {}, packageCache: {}, fullPaths: true,
        extensions: ['.jsx', '.js']
    });
    process.env.NODE_ENV = argv.prod ? "production" : "development";
    cb.transform(babelify.configure());
    cb.bundle()
        .pipe(source('main.js'))
        .pipe(gulpif(argv.prod, streamify(uglify())))
        .pipe(gulp.dest('./build/js/'));
});

gulp.task('copy-static', function() {
    gulp.src('./src/css/*.css')
        .pipe(copy('build/css',{prefix: 2}));
    gulp.src('./src/css/images/*.*')
        .pipe(copy('build/css/',{prefix: 2}));
});

gulp.task('copy-vendor', function() {
    gulp.src('./vendor/css/*.css')
        .pipe(copy('build/vendor/css/',{prefix: 2}));
    gulp.src('./vendor/js/*.js')
        .pipe(copy('build/vendor/js/',{prefix: 2}));
});

gulp.task('build',['html', 'convert-less', 'js', 'copy-static', 'copy-vendor']);

gulp.task('css', ['convert-less', 'watch-less']);

gulp.task('watch', ['connect', 'dev-build']);

gulp.task('dev-build', ['pages', 'css', 'scripts']);
