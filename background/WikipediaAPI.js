/******************************************
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 ******************************************/

(async () => {

	'use strict';

	const franc = require('franc');
	const fallbackLnag = await popoverDB.retrieve('fallbackLang');

	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.receiver === 'wikirepo') {

			wikiRepo[message.fnName](message.params)
				.then(resp => sendResponse(resp))

			return true; //It returns true to indicate that this is an async function.
		}
	});


	class WikiRepo {
		constructor() {}

		searchByTerm({ range = '', term, nlpLangs }) {
			return new Promise((resolve, reject) => {

				range.trim();

				var lang = identifyLanguage(range, nlpLangs);
				lang = lang === 'und' ? fallbackLnag : lang;

				var definitions = {
					langLinks: true,
					sentences: 3
				};

				http.get(`https:///${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages%7Cdescription%7Cextracts${definitions.langLinks?'%7Clanglinks':''}%7Cinfo&indexpageids=1&formatversion=2&piprop=thumbnail&pithumbsize=${imageSize}&pilimit=10&exsentences=${definitions.sentences}&exintro=1&explaintext=1&llprop=url&inprop=url&titles=${term}&redirects=1`)
					.then(response => {
						let pages = findKey(JSON.parse(response), 'pages');
						let data = {
							title: pages[0].title,
							body: pages[0].extract,
							image: pages[0].thumbnail,
							url: pages[0].fullurl
						}

						resolve(data);

					}).catch(error => {

						let data = {
							title: '',
							body: `Couldn't get an article for the term "${term}".`,
							image: {},
							url: ''
						}
						resolve(data);
					})
			});
		}

		searchById({ pageId, lang = 'en', imageSize = 250 }) {
			return new Promise((resolve, reject) => {

				var definitions = {
					langLinks: true,
					sentences: 3
				};

				http.get(`https://${lang==='rel'?'en':lang}.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages%7Cdescription%7Cextracts${definitions.langLinks?'%7Clanglinks':''}%7Cinfo&indexpageids=1&pageids=${pageId}&formatversion=2&piprop=thumbnail&pithumbsize=${imageSize}&pilimit=10&exsentences=${definitions.sentences}&exintro=1&explaintext=1&llprop=url&inprop=url&redirects=1`)
					.then(response => {

						let pages = findKey(JSON.parse(response), 'pages');
						let data = {};

						data.title = pages[0].title || '';
						data.body = pages[0].extract || '';
						data.image = pages[0].thumbnail || {};
						data.url = pages[0].fullurl || '';

						resolve(data);

					}).catch(error => {

						let data = {};
						data.title = '';
						data.body = `Couldn't get an article for the term "${term}".`;
						data.image = {};
						data.url = '';

						resolve(data);
					});
			});
		}

		searchTermList({ range = '', term, nlpLangs = ['eng'] }) {
			return new Promise((resolve, reject) => {

				var lang = identifyLanguage(range, nlpLangs);
				var disambiguation = {
					en: 'disambiguation',
					pt: 'desambiguação',
					es: 'desambiguación'
				};

				http.get(`https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages%7Cpageterms&revids=&generator=prefixsearch&formatversion=2&piprop=thumbnail&pithumbsize=70&pilimit=10&wbptterms=description&gpssearch=${term}&gpslimit=10`)
					.then(response => {

						let result = findKey(JSON.parse(response), 'pages');
						let data = [];

						if (Object.entries(result).length > 0) {
							data = result.map(el => {
								if (el.terms ? !el.terms.description[0].includes(disambiguation[lang]) : true) {
									return {
										index: el.index,
										pageId: el.pageid,
										title: el.title,
										body: el.terms ? el.terms.description[0] : '',
										img: el.thumbnail ? el.thumbnail.source : '',
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

		/**
		 * Searches an image on wikipedia by the given term.
		 * @param {object} obj The object containing the parameters.
		 * @param {String} obj.term The term to be searched on wikipedia.
		 * @returns {Promise.<object>} Returns a promise that resolves to an object with url, width, and height properties.
		 */
		searchImage({ term, size }) {
			return new Promise(async (resolve, reject) => {
				http.get(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${term}&pithumbsize=${size}&format=json`)
					.then(response => {

						let image = findKey(JSON.parse(response), 'thumbnail');

						resolve(image);
					}).catch(error => {

						let imageInfo = {};
						imageInfo.url = '';
						imageInfo.width = 250;
						imageInfo.height = 250;

						resolve(imageInfo);
						console.warn(`Couldn't get image for term "${term}"`);
					})
			});
		}
	}

	/**
	 * @summary Deep searches given key in the given object.
	 * @param {object} obj The object to be deep searched.
	 * @param {string} key The key to deep search in the object.
	 * 
	 */
	function findKey(obj, key) {

		var objArg = obj;

		return keyToFind(key);

		function keyToFind(key) {
			var result = {};

			Object.keys(obj).forEach(el => {
				if (el === key) {
					result = obj[el];
				} else if (typeof obj[el] == 'object') {
					result = findKey(obj[el], key);
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

	const wikiRepo = new WikiRepo();

})();