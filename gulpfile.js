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
const zip = require('gulp-zip');
const path = require('path');
const log = require('fancy-log');


const paths = { modules: { prod: "prod/public", dev: "public/modules" } };
const jsPaths = {
	jsDocTypes: "JSDocsTypes.js",
	apis: ["api/*.js"]
}


gulp.task('jsdoc', jsDoc);
gulp.task('prod', buildProd);

/**
 * Does all the processing to transfer files to production.
 * @param {*} done 
 */
function buildProd(done) {
	const filesToCopy = [
		{ src: paths.modules.dev + "/**/*.*", dest: paths.modules.prod },
		{ src: "public/images/icon01/*.png", dest: "prod/public/images/icon01/" },
		{ src: "manifest.json", dest: "prod/" },
		{ src: "_locales/en/*.*", dest: "prod/_locales/en" },
		{ src: "_locales/pt_BR/*.*", dest: "prod/_locales/pt_BR" },
		{ src: "_locales/pt_PT/*.*", dest: "prod/_locales/pt_PT" },
		{ src: ["optionsPage/*.html", "optionsPage/*.css"], dest: "prod/optionsPage/" },
		{ src: "contentScripts/*.css", dest: "prod/contentScripts/" }
	];

	const filesToBundle = [
		{ src: "background/eventPage.js", dest: "prod/background/" },
		{ src: "contentScripts/index.js", dest: "prod/contentScripts/"},
		{ src: "optionsPage/index.js", dest: "prod/optionsPage/" }
	];

	const htmlToProcess = "prod/**/*.html";

	bundle(filesToBundle)
		.then(() => copyFiles(filesToCopy)
			.then(() => injectFiles(htmlToProcess).on('end', () => {
				zipFiles({ src: "prod/**", dest: './' });
				done();
			})));
}

/**
 * Creates bundles of files and its dependencies.
 * @param {Array<FileSourceDestination>} optionsArray The options object.
 * @returns {Promise<NodeJS.ReadWriteStream>}
 */
function bundle(optionsArray = []) {
	log("");
	log.info("📚    Bundling files...");
	var pipeline = optionsArray.map(({ src, dest }) => {

		var fileName = path.extname(dest) ? path.basename(dest) : path.basename(src);
		var destName = path.extname(dest) ? path.dirname(dest) : dest;

		return new Promise((resolve, reject) =>
			browserify({ entries: src })
			.bundle()
			.pipe(source(fileName))
			.pipe(gulpif(args.verbose, gulpprint()))
			.pipe(buffer())
			.pipe(gulpif(args.debug, sourcemaps.init({ loadMaps: true })))
			.pipe(gulpif(args.debug, sourcemaps.write('./')))
			.pipe(gulpif(args.debug,
				minify({ ext: { src: '.js', min: '-min.js' } }),
				minify({ ext: { src: '-debug.js', min: '.js' }, noSource: true })))
			.pipe(gulp.dest(destName))
			.on('end', resolve));
	});

	return Promise.all(pipeline);
}

/**
 * Creates a zip file of given source.
 * @param {Array<FileSourceDestination>} optionsArray The options object.
 * @returns {NodeJS.ReadWriteStream}
 */
function copyFiles(optionsArray = []) {
	log("");
	log.info("🔪    Copying files...");
	var pipeline = optionsArray.map(({ src, dest }) => {
		return new Promise((resolve, reject) =>
			gulp.src(src)
			.pipe(gulpif(args.verbose, gulpprint()))
			.pipe(gulp.dest(dest))
			.on('end', resolve));
	});

	return Promise.all(pipeline);
}

/**
 * Injects JS and CSS elements on the demarcated lines of an HTML file.
 * @param {string} src The path of the html files to process.
 * @returns {Promise<NodeJS.ReadWriteStream>}
 */
function injectFiles(src) {
	log("");
	log.info("💉    Injecting CSS & HTML...");

	return gulp.src(src)
		.pipe(inject(gulp.src([paths.modules.prod + "/**/*.css", paths.modules.prod + "/**/*.js"]), { relative: true }))
		.pipe(gulp.dest("prod/"));
}

/**
 * Creates a zip file of given source.
 * @param {FileSourceDestination} args The options object.
 * @param {string | Array<string>} args.src The path of the folder or file to be zipped.
 * @param {string} args.dest The path to be created the zip.
 * @returns {NodeJS.ReadWriteStream}
 */
function zipFiles({ src, dest }) {
	log("");
	log.info("📦    Zipping files...");
	return gulp.src(src).pipe(zip('prod.zip')).pipe(gulp.dest(dest));
}

/**
 * Generates the automatica documentation for the project
 * @param {*} done 
 */
function jsDoc(done) {
	gulp.src(jsPaths.apis.concat(jsPaths.jsDocTypes), { read: false })
		.pipe(gulpif(args.verbose, gulpprint()))
		.pipe(jsdoc(done));

	done();
}