'use strict';

var gulp        = require('gulp'),
	sourcemaps  = require('gulp-sourcemaps'),
	rename      = require('gulp-rename'),
	babel       = require('gulp-babel'),
	uglify      = require('gulp-uglify'),
	rm          = require('gulp-rimraf'),
	changed     = require('gulp-changed'),
	browserify  = require('browserify'),
	source      = require('vinyl-source-stream'),
	htmlreplace	= require('gulp-html-replace'),
	htmlmin 	= require('gulp-htmlmin'),
	cleanCSS 	= require('gulp-clean-css');

gulp.task('default', ['clean', 'compile']);
gulp.task('browser', ['browserify']);
gulp.task('deploy', ['browserify', 'minify-js', 'minify-css', 'inline']);

gulp.task('clean', function() {
	return gulp.src('src/*').pipe(rm());
});

gulp.task('compile', ['clean'], function() {
	return gulp.src('dev/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel({presets: ['es2015']}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./src'));
});

gulp.task('browserify', ['default'], function() {
	var stream = browserify({
		entries: 'src/Browser.js',
	})
	.bundle();

	return stream.pipe(source('tetris.js'))
		.pipe(gulp.dest('./dist'));
});

gulp.task('minify-js', ['browserify'], function() {
	return gulp.src('dist/tetris.js')
	  .pipe(uglify())
	  .pipe(rename({ extname: '.min.js' }))
	  .pipe(gulp.dest('./dist'));
});

gulp.task('minify-css', function() {
	return gulp.src('tetris.css')
		.pipe(cleanCSS({compatibility: 'ie8'}))
		.pipe(rename({ extname: '.min.css' }))
		.pipe(gulp.dest('dist'));
});

gulp.task('inline', ['minify-js', 'minify-css'], function() {
	return gulp.src('index.html')
    	.pipe(htmlreplace({
			cssInline: {
				src: gulp.src('dist/tetris.min.css'),
				tpl: '<style>%s</style>'
			},
			jsInline: {
				src: gulp.src('dist/tetris.min.js'),
				tpl: '<script type="text/javascript">%s</script>'
			}
    	}))
    	.pipe(htmlmin({collapseWhitespace: true}))    	
    	.pipe(gulp.dest('dist/'));
});


