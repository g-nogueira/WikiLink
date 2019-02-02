const gulp = require('gulp');
const minify = require('gulp-minify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const args = require('yargs').argv;
const gulpprint = require('gulp-print').default;
const gulpif = require('gulp-if');
const jsdoc = require('gulp-jsdoc3');
const inject = require('gulp-inject');
const fs = require('fs');
const nodePath = require('path');
const stringreplace = require('gulp-string-replace');


const modulesPath = { prod: "prod/public", dev: "public/modules" };
const jsPaths = {
	jsDocTypes: "JSDocsTypes.js",
	apis: ["api/*.js"]
}


gulp.task('jsdoc', jsDoc);
gulp.task('prod', buildProd);

function buildProd(done) {

	bundleToProd({ fileName: "eventPage.js", entries: ["background/eventPage.js"] });
	bundleToProd({ fileName: "contentScripts/contentScript.js", entries: ["contentScripts/index.js"] });
	bundleToProd({ fileName: "optionsPage/index.js", entries: ["optionsPage/index.js"] });
	try {
		fs.accessSync(modulesPath.prod + "/**.*", fs.constants.F_OK)
	} catch (error) {
		copyToProd({ source: modulesPath.dev + "/**/*.*", destiny: "public/" });
	}
	copyToProd({ source: "public/images/icon01/*.png", destiny: "public/images/icon01/" });
	copyToProd({ source: "manifest.json", destiny: "" });
	copyToProd({ source: "_locales/en/*.*", destiny: "_locales/en" });
	copyToProd({ source: "_locales/pt_BR/*.*", destiny: "_locales/pt_BR" });
	copyToProd({ source: "_locales/pt_PT/*.*", destiny: "_locales/pt_PT" });
	
	copyToProd({ source: ["optionsPage/*.html","optionsPage/*.css"], destiny: "optionsPage" });
	copyToProd({ source: "contentScripts/*.css", destiny: "contentScripts" });
	
	processHtml("prod/**/*.html");

	done();
}

function bundleToProd({ fileName = "", entries = [] }) {
	var browserifyObject = browserify({ entries: entries, debug: true });

	browserifyObject.bundle()
		.pipe(source(fileName))
		.pipe(gulpif(args.verbose, gulpprint()))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(sourcemaps.write('./'))
		.pipe(minify())
		.pipe(gulp.dest("./prod/"));
}

function copyToProd({ source, destiny }) {
	gulp.src(source).pipe(gulp.dest("./prod/" + destiny));
}

function processHtml(source) {
	gulp.src(source)
	.pipe(inject(gulp.src([modulesPath.prod + "/**/*.css", modulesPath.prod + "/**/*.js"], { read: false })))
	.pipe(gulp.dest("."));
}

function jsDoc(done) {
	gulp.src(jsPaths.apis.concat(jsPaths.jsDocTypes), { read: false })
		.pipe(gulpif(args.verbose, gulpprint()))
		.pipe(jsdoc(done));

	done();
}