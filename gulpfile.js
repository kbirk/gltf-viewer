(function() {

    'use strict';

    let gulp = require('gulp');
    let watchify = require('watchify');
    let concat = require('gulp-concat');
    let source = require('vinyl-source-stream');
    let del = require('del');
    let jshint = require('gulp-jshint');
    let browserify = require('browserify');
    let csso = require('gulp-csso');
    let runSequence = require('run-sequence');
    let merge = require('merge-stream');
    let nodemon = require('gulp-nodemon');
    let babel = require('babelify');

    let project = 'gltf-viewer';
    let basePath = 'webapp/';
    let paths = {
        root: basePath + 'app.js',
        scripts: [ basePath + 'scripts/**/*.js', basePath + 'app.js' ],
        styles: [ basePath + 'styles/**/*.css' ],
        index: [  basePath + 'index.html' ],
        build: 'build',
        resources: [
            basePath + 'index.html',
            basePath + 'models/**/*'
        ]
    };

    function handleError(err) {
        console.log(err);
        this.emit('end');
    }

    function bundle(bundler) {
        let watcher = watchify(bundler);
        return watcher
            .on('update', function(files) {
                // When any files updates
                console.log('\nWatch detected changes to [', files.join(', '), ']');
                // lint changed files
                let linting = gulp.src(files)
                    .pipe(jshint('.jshintrc'))
                    .pipe(jshint.reporter('jshint-stylish'));
                // re-bundle
                let bundling = watcher.bundle()
                    .on('error', handleError)
                    .pipe(source(project + '.js'))
                    .pipe(gulp.dest(paths.build));
                return merge(linting, bundling);
            })
            .bundle() // Create the initial bundle when starting the task
            .on('error', handleError)
            .pipe(source(project + '.js'))
            .pipe(gulp.dest(paths.build));
    }

    gulp.task('clean', function(done) {
        del.sync(paths.build);
        done();
    });

    gulp.task('lint', function() {
        return gulp.src(paths.scripts)
            .pipe(jshint('.jshintrc'))
            .pipe(jshint.reporter('jshint-stylish'));
    });

    gulp.task('build-scripts', function() {
        let bundler = browserify(paths.root, {
            debug: true,
            standalone: project
        }).transform(babel, {
            presets: [ 'es2015' ]
        });
        return bundle(bundler);
    });

    gulp.task('build-styles', function () {
        return gulp.src(paths.styles)
            .pipe(csso())
            .pipe(concat(project + '.css'))
            .pipe(gulp.dest(paths.build));
    });

    gulp.task('copy-resources', function() {
        return gulp.src(paths.resources, {
                base: basePath
            })
            .pipe(gulp.dest(paths.build));
    });

    gulp.task('build', function(done) {
        runSequence(
            [ 'clean', 'lint' ],
            [ 'build-scripts', 'build-styles', 'copy-resources' ],
            done);
    });

    gulp.task('serve', [ 'build' ], function() {
        return nodemon({
            script: 'server/server.js',
            watch: [ 'server/**/*.js' ]
        });
    });

    gulp.task('watch', [ 'build' ], function(done) {
        gulp.watch(paths.styles, [ 'build-styles' ]);
        gulp.watch(paths.resources, [ 'copy-resources' ]);
        done();
    });

    gulp.task('default', [ 'watch', 'serve' ], function() {
    });

}());
