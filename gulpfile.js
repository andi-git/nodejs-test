var gulp = require('gulp');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');
var nodeunit = require('gulp-nodeunit');

gulp.task('default', ['clean', 'compile-ts', 'nodeunit-test']);

gulp.task('integration', ['clean', 'compile-ts', 'nodeunit-test', 'nodeunit-integrationtest']);

gulp.task('clean', function () {
    gutil.log('clean output');
    gulp.src('dist/*').pipe(clean());
});

gulp.task('compile-ts', ['clean'], function () {
    gutil.log('compile type-script');
    var tsResult = tsProject.src().pipe(ts(tsProject));
    return tsResult.js.pipe(gulp.dest('dist'));
});

gulp.task('nodeunit-test', ['compile-ts'], function () {
    gutil.log('running tests with nodeunit');
    gulp.src('dist/test/unit/**/*.spec.js')
        .pipe(nodeunit({
            reporter: 'junit',
            reporterOptions: {
                output: 'nodeunit-report'
            }
        }));
});

gulp.task('nodeunit-integrationtest', ['nodeunit-test'], function () {
    gutil.log('running integrationtests with nodeunit');
    gulp.src('dist/test/integration/**/*.spec.js')
        .pipe(nodeunit({
            reporter: 'junit',
            reporterOptions: {
                output: 'nodeunit-report'
            }
        }));
});
