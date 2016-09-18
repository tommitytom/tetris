const gulp = require('gulp');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rm = require('gulp-rimraf');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const htmlreplace = require('gulp-html-replace');
const htmlmin = require('gulp-htmlmin');
const cleanCSS = require('gulp-clean-css');
const minimist = require('minimist');
const sftp = require('gulp-sftp');

const args = minimist(process.argv.slice(2));

gulp.task('default', ['browserify']);
gulp.task('dist', ['inline']);
gulp.task('deploy', ['upload']);

gulp.task('clean', function() {
	return gulp.src(['./build/*', './dist/*']).pipe(rm());
});

gulp.task('compile', ['clean'], function() {
	return gulp.src('./src/*.js')
		.pipe(babel({ presets: ['es2015'] }))
		.pipe(gulp.dest('./build/intermediate'));
});

gulp.task('browserify', ['compile'], function() {
	var stream = browserify({
		entries: './build/intermediate/Browser.js',
	})
	.bundle();

	return stream.pipe(source('tetris.js'))
		.pipe(gulp.dest('./build'));
});

gulp.task('minify-js', ['browserify'], function() {
	return gulp.src('./build/tetris.js')
	  .pipe(uglify())
	  .pipe(rename({ extname: '.min.js' }))
	  .pipe(gulp.dest('./build'));
});

gulp.task('minify-css', ['compile'], function() {
	return gulp.src('./src/tetris.css')
		.pipe(cleanCSS({ compatibility: 'ie8' }))
		.pipe(rename({ extname: '.min.css' }))
		.pipe(gulp.dest('./build'));
});

gulp.task('inline', ['minify-js', 'minify-css'], function() {
	return gulp.src('./src/index.html')
		.pipe(htmlreplace({
			cssInline: {
				src: gulp.src('./build/tetris.min.css'),
				tpl: '<style>%s</style>'
			},
			jsInline: {
				src: gulp.src('./build/tetris.min.js'),
				tpl: '<script type="text/javascript">%s</script>'
			}
		}))
		.pipe(htmlmin({ collapseWhitespace: true }))    	
		.pipe(gulp.dest('./dist/'));
});

gulp.task('upload', ['inline'], function() {
	return gulp.src('dist/index.html')
		.pipe(sftp({
			host: args.host,
			user: args.user,
			pass: args.pass,
			remotePath: args.remote
		}));
});