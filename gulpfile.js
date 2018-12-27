var gulp = require('gulp');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('default', defaultTask);
gulp.task('prod', buildProd);

function defaultTask(done) {
	// place code for your default task here
	done();
}

function buildProd(done) {
	var file = browserify({
		entries: "background/WikipediaAPI.js",
		debug: true
	});

	file.bundle()
	.pipe(source('wikiapi.js'))
    .pipe(buffer())
	.pipe(sourcemaps.init({loadMaps: true}))
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest("./prod/"));

	done();
}