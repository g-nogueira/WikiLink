(() => {
	"use strict";

	const franc = require("franc");
	const popoverDB = require("../utils/DEPRECATED_StorageManager");
	const WKAPI = require("@g-nogueira/wikipediaapi");

	/**
	 * @summary The api for searching terms, images, and articles on Wikipedia.
	 */
	class WikipediaRepo {
		constructor() {}

		/**
		 * @summary Searches an image on Wikipedia by given term and size.
		 * @param {object} options
		 * @param {string} options.term The term to be searched for.
		 * @param {number} options.size The height in pixels of the image;
		 * @returns {Promise<WikipediaImage>} Returns a promise that resolves to an object with url, width, and height properties.
		 */
		async searchImage({ term, size }) {
			// THIS IS NEVER USED, SO IT WASN'T TESTED

			let page = await WKAPI.searchImage(term, "en", size);

			if (!page) {
				return { url: "", width: 250, height: 250 };
			}

			let image = findKey("thumbnail", JSON.parse(page));

			return image;
		}

		/**
		 * @summary Searchs a single page on Wikipedia containing given term.
		 * @param {Object} options
		 * @param {string} options.term The full or partial article title to be searched for.
		 * @param {string} [options.range] A set of words in the same language as the term.
		 * @returns {Promise<{WikipediaPage}>} Returns a promise tha resolves to an object `WikipediaPage`.
		 */
		async searchTerm({ range = "", term = "" }) {
			// THIS IS NEVER USED, SO IT WASN'T TESTED

			const fallbackLang = await popoverDB.retrieve("fallbackLang");
			let nlpWhiteList = (await popoverDB.retrieve("nlpLangs")) || ["eng"];

			let lang = identifyLanguage(range.trim(), nlpWhiteList);
			lang = lang === "und" ? fallbackLang : lang;

			let page = await WKAPI.searchTitle(term, lang, imageSize);

			let data = {
				title: page.title,
				body: page.extract,
				image: page.thumbnail,
				url: page.fullurl,
			};

			return data;
		}

		/**
		 * @summary Searchs a single page on Wikipedia containing given id.
		 * @param {object} options
		 * @param {number|string} options.pageId The id of the article page.
		 * @param {string} [options.language=en] A set of words in the same language as the term.
		 * @param {number|string} [options.imageSize=250] The height of the article's image, in pixel.
		 * @returns {Promise<{WikipediaPage}>} Returns a promise tha resolves to an object `WikipediaPage`.
		 */
		async getPageById({ pageId, language = "en", imageSize = 250 }) {
			let page = await WKAPI.getPageById(pageId, language, imageSize);
			let data = {
				title: page.title || "",
				text: page.extract || "",
				image: page.thumbnail || {},
				url: page.fullurl || "",
			};

			return data;
		}

		/**
		 * @summary Searchs a list of pages containing given term.
		 * @param {object} options
		 * @param {string} [options.range] A set of words in the same language as the term.
		 * @param {string} options.term The full or partial article title to be searched for.
		 * @returns {Promise<{WikipediaThumbnail}>} Returns a promise tha resolves to an object `WikipediaThumbnail`.
		 */
		async getPageList({ range = "", term }) {
			let nlpWhiteList = (await popoverDB.retrieve("nlpLangs")) || ["eng"];
			let lang = identifyLanguage(range, nlpWhiteList);

			let list = await WKAPI.searchResults(term, lang, 70, false);
			let data = [];

			if (Object.entries(list).length > 0) {
				data = list.map((page) => ({
					index: page.index,
					pageId: page.pageid,
					title: page.title,
					body: (page.terms && page.terms.description[0]) || "",
					image: (page.thumbnail && page.thumbnail.source) || "",
					lang: lang,
				}));
			}
			return data;
		}
	}

	module.exports = new WikipediaRepo();

	/**
	 * @summary Deep searches given key in the given object.
	 * @param {object} obj The object to be deep searched.
	 * @param {string} key The key to deep search in the object.
	 *
	 */
	function findKey(key, obj) {
		return keyToFind(key);

		function keyToFind(key) {
			var result = {};

			Object.keys(obj).forEach((el) => {
				if (el === key) {
					result = obj[el];
				} else if (typeof obj[el] == "object") {
					result = findKey(key, obj[el]);
				}
			});

			return result;
		}
	}

	/**
	 * Identifies the language of given argument string. The default is english.
	 * @param {string} extract The string to identify the language.
	 */
	function identifyLanguage(extract, langs = ["eng"]) {
		// var testUTF8 = /([^\u0000-\u0040\u005B-\u0060\u007B-\u00BF\u02B0-\u036F\u00D7\u00F7\u2000-\u2BFF])+/g;
		// var testDiacritics = /[\u00C0-\u00FF]/g;
		// var text = extract && extract.match(testUTF8).toString();
		// var isDiacritic = testDiacritics.test(text);

		var languages = {
			por: "pt",
			eng: "en",
			spa: "es",
			rus: "ru",
		};

		if (langs.length === 1) {
			return languages[langs[0]];
		} else {
			let francRes = franc(extract, { whitelist: langs });
			return languages[francRes] || "en";
		}
	}
})();
