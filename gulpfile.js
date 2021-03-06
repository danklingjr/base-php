// RESOURCES USED TO MAKE THIS GULP FILE:
// http://www.revsys.com/blog/2014/oct/21/ultimate-front-end-development-setup/
// http://ericlbarnes.com/setting-gulp-bower-bootstrap-sass-fontawesome/
// https://markgoodyear.com/2014/01/getting-started-with-gulp/
// https://github.com/mikaelbr/gulp-notify/issues/81
// ------------------------------------------------------------------------------------

const gulp = require('gulp');
const sass = require('gulp-sass');
const watch = require('gulp-watch');
const plumber = require('gulp-plumber');
const minifycss = require('gulp-minify-css');
const rename = require('gulp-rename');
const gzip = require('gulp-gzip');
const livereload = require('gulp-livereload');
const notify = require("gulp-notify");
const gutil = require("gulp-util");
const sourcemaps = require("gulp-sourcemaps");

const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

var gzip_options = {
    threshold: '1kb',
    gzipOptions: {
        level: 9
    }
};

var reportError = function (error) {
    var lineNumber = (error.lineNumber) ? 'LINE ' + error.lineNumber + ' -- ' : '';

    notify({
        title: 'Task Failed [' + error.plugin + ']',
        message: lineNumber + 'See console.',
        sound: 'Sosumi' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
    }).write(error);

    gutil.beep(); // Beep 'sosumi' again

    // Inspect the error object
    // console.log(error);

    // Easy error reporting
    // console.log(error.toString());

    // Pretty error reporting
    var report = '';
    var chalk = gutil.colors.black.bgRed;

    report += chalk('TASK:') + ' [' + error.plugin + ']\n';
    report += chalk('PROB:') + ' ' + error.message + '\n';
    if (error.lineNumber) { report += chalk('LINE:') + ' ' + error.lineNumber + '\n'; }
    if (error.fileName)   { report += chalk('FILE:') + ' ' + error.fileName + '\n'; }
    console.error(report);

    // Prevent the 'watch' task from stopping
    this.emit('end');
}


gulp.task('styles', function () {
    return gulp.src('resources/scss/*.scss')
    .pipe(plumber({
        errorHandler: reportError
    }))
    .pipe(sourcemaps.init())
    .pipe(sass())
        .pipe(gulp.dest('build/css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('build/css'))
        .pipe(gzip(gzip_options))
        .pipe(gulp.dest('build/css'))
        .pipe(notify("SCSS Compiled!"))
        .on('error', reportError)
        .pipe(livereload());
});

gulp.task('scripts', () =>
    gulp.src(['bower_components/jquery/dist/jquery.js','resources/js/theme.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('build/js/'))
);

gulp.task('shivs', function() {
    return gulp.src(['resources/js/includes/html5-3.6-respond-1.4.2.min.js'])
      .pipe(gulp.dest('build/js/'))
});

/* Watch Files For Changes */
gulp.task('watch', function() {
    livereload.listen();
    gulp.watch('resources/scss/**/*', ['styles']);
    gulp.watch('resources/js/*.js', ['scripts']);
    gulp.watch('*.php').on('change', livereload.changed);
    gulp.watch('*.html').on('change', livereload.changed);
    gulp.watch('*').on('change', livereload.changed);
});

gulp.task('default', ['styles','scripts','shivs', 'watch']);
