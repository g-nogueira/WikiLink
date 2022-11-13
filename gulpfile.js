const gulp = require("gulp");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const sourcemaps = require("gulp-sourcemaps");
const args = require("yargs").argv;
const gulpprint = require("gulp-print").default;
const gulpif = require("gulp-if");
const jsdoc = require("gulp-jsdoc3");
const inject = require("gulp-inject");
const zip = require("gulp-zip");
const path = require("path");
const log = require("fancy-log");
const watch = require("gulp-watch");

gulp.task("document", generateDocumentation);
gulp.task("build", buildProd);

const paths = {
	dev: {
		publicLibrary: "public/library/",
		publicImages: "public/images/",
		manifest: "manifest.json",
		locales: "_locales/",
		background: "background/",
		contentScripts: "contentScripts/",
		optionsPage: "optionsPage/",
		action: "action/",
		api: "api/",
		docTypesDefinitions: "JSDocsTypes.js",
	},
	prod: {
		publicLibrary: "prod/public/",
		publicImages: "prod/public/images/",
		locales: "prod/_locales/",
		background: "prod/background/",
		contentScripts: "prod/contentScripts/",
		optionsPage: "prod/optionsPage/",
		action: "prod/action/",
		path: "prod/",
	},
};

/**
 * Does all the processing to transfer files to production.
 * @param {*} done
 */
function buildProd(done) {
	const filesToCopy = [
		{ src: paths.dev.publicLibrary + "**/*.*", dest: paths.prod.publicLibrary },
		{ src: paths.dev.publicImages + "icon01/*.png", dest: paths.prod.publicImages + "icon01/" },
		{ src: paths.dev.manifest, dest: paths.prod.path },
		{ src: paths.dev.locales + "en/*.*", dest: paths.prod.locales + "en" },
		{ src: paths.dev.locales + "pt_BR/*.*", dest: paths.prod.locales + "pt_BR" },
		{ src: paths.dev.locales + "pt_PT/*.*", dest: paths.prod.locales + "pt_PT" },
		{ src: [paths.dev.optionsPage + "*.html", paths.dev.optionsPage + "*.css"], dest: paths.prod.optionsPage },
		{ src: [paths.dev.action + "*.html", paths.dev.action + "*.css"], dest: paths.prod.action },
		{ src: paths.dev.contentScripts + "*.css", dest: paths.prod.contentScripts },
	];

	const filesToBundle = [
		{ src: paths.dev.background + "worker.js", dest: paths.prod.background },
		{ src: paths.dev.contentScripts + "index.js", dest: paths.prod.contentScripts },
		{ src: paths.dev.optionsPage + "index.js", dest: paths.prod.optionsPage },
		{ src: paths.dev.action + "index.js", dest: paths.prod.action },
	];

	const htmlToProcess = "prod/**/*.html";

	transpile().then(() =>
		bundle(filesToBundle).then(() =>
			copyFiles(filesToCopy).then(() =>
				injectFiles(htmlToProcess).on("end", () => {
					zipFiles({ src: "prod/**", dest: "./" });
					done();
				})
			)
		)
	);
}

function transpile() {
	return new Promise((resolve, reject) => {
		tsProject.src().pipe(tsProject()).js.pipe(gulp.dest("dist")).on("end", resolve);
	});
}

/**
 * Creates bundles of files and its dependencies.
 * @param {Array<FileSourceDestination>} optionsArray The options object.
 * @returns {Promise<NodeJS.ReadWriteStream>}
 */
function bundle(optionsArray = []) {
	log.info("📚 Bundling files...");
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
				.pipe(gulpif(args.debug, sourcemaps.write("./")))
				// .pipe(gulpif(args.debug,
				// 	minify({ ext: { src: '.js', min: '-min.js' } }),
				// 	minify({ ext: { src: '-debug.js', min: '.js' }, noSource: true })))
				.pipe(gulp.dest(destName))
				.on("end", resolve)
		);
	});

	return Promise.all(pipeline);
}

/**
 * Creates a zip file of given source.
 * @param {Array<FileSourceDestination>} optionsArray The options object.
 * @returns {NodeJS.ReadWriteStream}
 */
function copyFiles(optionsArray = []) {
	log.info("🔪 Copying files...");
	var pipeline = optionsArray.map(({ src, dest }) => {
		return new Promise((resolve, reject) => gulp.src(src).pipe(gulpif(args.verbose, gulpprint())).pipe(gulp.dest(dest)).on("end", resolve));
	});

	return Promise.all(pipeline);
}

/**
 * Injects JS and CSS elements on the demarcated lines of an HTML file.
 * @param {string} src The path of the html files to process.
 * @returns {Promise<NodeJS.ReadWriteStream>}
 */
function injectFiles(src) {
	log.info("💉 Injecting CSS & HTML...");

	return gulp
		.src(src)
		.pipe(inject(gulp.src([paths.prod.publicLibrary + "**/*.css", paths.prod.publicLibrary + "/**/*.js"]), { relative: true }))
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
	log.info("📦 Zipping files...");
	return gulp.src(src).pipe(zip("prod.zip")).pipe(gulp.dest(dest));
}

/**
 * Generates the automatica documentation for the project
 * @param {*} done
 */
function generateDocumentation(done) {
	gulp.src([paths.dev.api + "*.js", paths.dev.docTypesDefinitions], { read: false })
		.pipe(gulpif(args.verbose, gulpprint()))
		.pipe(jsdoc(done));

	done();
}
