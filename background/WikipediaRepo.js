(() => {

	'use strict';

	const franc = require('franc');
	const http = require('../utils/Http');
	const popoverDB = require('../utils/StorageManager');


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
		searchImage({ term, size }) {
			return new Promise(resolve => {
				http.get(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${term}&pithumbsize=${size}&format=json`)
					.then(response => {

						let image = findKey('thumbnail', JSON.parse(response));
						resolve(image);

					}).catch(error => {

						let imageInfo = {};
						imageInfo.url = '';
						imageInfo.width = 250;
						imageInfo.height = 250;

						resolve(imageInfo);
					})
			});
		}

		/**
		 * @summary Searchs a single page on Wikipedia containing given term.
		 * @param {Object} options
		 * @param {string} options.term The full or partial article title to be searched for.
		 * @param {string} [options.range] A set of words in the same language as the term.
		 * @returns {Promise<{WikipediaPage}>} Returns a promise tha resolves to an object `WikipediaPage`.
		 */
		searchTerm({ range = '', term = '' }) {

			return new Promise(async resolve => {
				const fallbackLang = await popoverDB.retrieve('fallbackLang');
				var nlpWhiteList = await popoverDB.retrieve('nlpLangs') || ['eng'];

				var lang = identifyLanguage(range.trim(), nlpWhiteList);
				var settings = {
					langLinks: true,
					sentences: 3
				};
				lang = lang === 'und' ? fallbackLang : lang;
				var url = `https:///${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages%7Cdescription%7Cextracts${settings.langLinks?'%7Clanglinks':''}%7Cinfo&indexpageids=1&formatversion=2&piprop=thumbnail&pithumbsize=${imageSize}&pilimit=10&exsentences=${settings.sentences}&exintro=1&explaintext=1&llprop=url&inprop=url&titles=${term}&redirects=1`;

				http.get(url).then(response => {

					let pages = findKey('pages', JSON.parse(response));
					let data = {
						title: pages[0].title,
						body: pages[0].extract,
						image: pages[0].thumbnail,
						url: pages[0].fullurl
					}

					resolve(data);

				}).catch(error => resolve(null));

			});
		}

		/**
		 * @summary Searchs a single page on Wikipedia containing given id.
		 * @param {object} options
		 * @param {number|string} options.pageId The id of the article page.
		 * @param {string} [options.language=en] A set of words in the same language as the term.
		 * @param {number|string} [options.imageSize=250] The height of the article's image, in pixel.
		 * @returns {Promise<{WikipediaPage}>} Returns a promise tha resolves to an object `WikipediaPage`.
		 */
		getPageById({ pageId, language = 'en', imageSize = 250 }) {
			return new Promise(resolve => {

				var definitions = {
					langLinks: true,
					sentences: 3
				};
				var url = `https://${language ==='rel'?'en' : language}.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages%7Cdescription%7Cextracts${definitions.langLinks ? '%7Clanglinks' : ''}%7Cinfo&indexpageids=1&pageids=${pageId}&formatversion=2&piprop=thumbnail&pithumbsize=${imageSize}&pilimit=10&exsentences=${definitions.sentences}&exintro=1&explaintext=1&llprop=url&inprop=url&redirects=1`;

				http.get(url).then(response => {
					let pages = findKey('pages', JSON.parse(response));
					let data = {
						title: pages[0].title || '',
						text: pages[0].extract || '',
						image: pages[0].thumbnail || {},
						url: pages[0].fullurl || ''
					}

					resolve(data);

				}).catch(error => resolve(null));
			});
		}

		/**
		 * @summary Searchs a list of pages containing given term.
		 * @param {object} options
		 * @param {string} [options.range] A set of words in the same language as the term.
		 * @param {string} options.term The full or partial article title to be searched for.
		 * @returns {Promise<{WikipediaThumbnail}>} Returns a promise tha resolves to an object `WikipediaThumbnail`.
		 */
		getPageList({ range = '', term }) {
			return new Promise(async resolve => {

				var nlpWhiteList = await popoverDB.retrieve('nlpLangs') || ['eng'];
				var lang = identifyLanguage(range, nlpWhiteList);

				var disambiguation = {
					en: 'disambiguation',
					pt: 'desambiguação',
					es: 'desambiguación'
				};
				var url = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages%7Cpageterms&revids=&generator=prefixsearch&formatversion=2&piprop=thumbnail&pithumbsize=70&pilimit=10&wbptterms=description&gpssearch=${term}&gpslimit=10`;

				http.get(url).then(list => {
					let pages = findKey('pages', JSON.parse(list));
					let data = [];

					if (Object.entries(pages).length > 0) {
						data = pages.map(page => {
							var isDesambiguation = page.terms && page.terms.description[0].includes(disambiguation[lang]);
							if (!isDesambiguation) {
								return {
									index: page.index,
									pageId: page.pageid,
									title: page.title,
									body: page.terms && page.terms.description[0] || '',
									image: page.thumbnail && page.thumbnail.source || '',
									lang: lang
								};
							}
						});
						data.sort((elA, elB) => elA.index - elB.index);
					}

					resolve(data);
				});
			});
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

			Object.keys(obj).forEach(el => {
				if (el === key) {
					result = obj[el];
				} else if (typeof obj[el] == 'object') {
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
	function identifyLanguage(extract, langs = ['eng']) {
		// var testUTF8 = /([^\u0000-\u0040\u005B-\u0060\u007B-\u00BF\u02B0-\u036F\u00D7\u00F7\u2000-\u2BFF])+/g;
		// var testDiacritics = /[\u00C0-\u00FF]/g;
		// var text = extract && extract.match(testUTF8).toString();
		// var isDiacritic = testDiacritics.test(text);

		var languages = {
			por: 'pt',
			eng: 'en',
			spa: 'es',
			rus: 'ru',
		};


		if (langs.length === 1) {
			return languages[langs[0]];
		} else {
			let francRes = franc(extract, { whitelist: langs });
			return languages[francRes] || 'en';
		}
	}

})();