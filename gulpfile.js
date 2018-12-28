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

	bundleToProd({ fileName: "eventPage.js", entries: ["background/eventPage.js"] });
	bundleToProd({ fileName: "contentScripts/contentScript.js", entries: ["contentScripts/index.js"] });
	bundleToProd({ fileName: "optionsPage/index.js", entries: ["optionsPage/index.js"] });
	copyToProd({ source: "optionsPage/*.html", destiny: "optionsPage" });
	copyToProd({ source: "optionsPage/*.css", destiny: "optionsPage" });
	copyToProd({ source: "contentScripts/*.css", destiny: "contentScripts" });

	done();
}

function bundleToProd({ fileName= "", entries= [] }) {
	var browserifyObject = browserify({ entries: entries, debug: true });

	browserifyObject.bundle()
		.pipe(source(fileName))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest("./prod/"));
}

function copyToProd({ source, destiny }) {
	gulp.src(source).pipe(gulp.dest("./prod/"+destiny));
}