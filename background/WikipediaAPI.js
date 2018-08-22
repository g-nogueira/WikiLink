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
	const fallbackLang = await popoverDB.retrieve('fallbackLang');

	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.receiver.toLowerCase() === 'wikirepo') {

			wikiRepo[message.fnName](message.params).then(sendResponse)
			return true; //It returns true to indicate that this is an async function.
		}
	});

	class WikiRepo {
		constructor() {
			this.searchByTerm = searchByTerm;
			this.searchById = searchById;
			this.searchTermList = searchTermList;
			this.searchImage = searchImage;
		}
	}

	/**
	 * Searches an image on Wikipedia by the given term and size.
	 * @param {object} obj The object containing the parameters.
	 * @param {String} obj.term The term to be searched on wikipedia.
	 * @param {number} obj.size The height in pixel of the image;
	 * @returns {Promise.<object>} Returns a promise that resolves to an object with url, width, and height properties.
	 */
	function searchImage({ term, size }) {
		return new Promise(async resolve => {
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

	function searchByTerm({ range = '', term, nlpLangs }) {
		return new Promise(resolve => {

			var lang = identifyLanguage(range.trim(), nlpLangs);
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

	function searchById({ pageId, lang = 'en', imageSize = 250 }) {
		return new Promise(resolve => {

			var definitions = {
				langLinks: true,
				sentences: 3
			};
			var url = `https://${lang ==='rel'?'en' : lang}.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages%7Cdescription%7Cextracts${definitions.langLinks ? '%7Clanglinks' : ''}%7Cinfo&indexpageids=1&pageids=${pageId}&formatversion=2&piprop=thumbnail&pithumbsize=${imageSize}&pilimit=10&exsentences=${definitions.sentences}&exintro=1&explaintext=1&llprop=url&inprop=url&redirects=1`;

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

	function searchTermList({ range = '', term, nlpLangs = ['eng'] }) {
		return new Promise(resolve => {

			var lang = identifyLanguage(range, nlpLangs);
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
								img: page.thumbnail && page.thumbnail.source || '',
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

	const wikiRepo = new WikiRepo();

})();