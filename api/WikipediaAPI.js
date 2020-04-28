(() => {

	'use strict';

	/**
	 * @summary The api for searching terms, images, and articles on Wikipedia.
	 */
	class WikipediaAPI {
		constructor() { }

		/**
		 * @summary Searches an image on Wikipedia by given term and size.
		 * @param {object} options
		 * @param {string} options.term The term to be searched for.
		 * @param {number} options.size The height in pixels of the image;
		 * @returns {Promise<WikipediaImage>} Returns a promise that resolves to an object with url, width, and height properties.
		 */
		searchImage({ term, size }) {
			return new Promise(resolve => {
				chrome.runtime.sendMessage({ provider: 'wp', request: 'searchImage', args: [term, "en", size] }, resolve);
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

			return new Promise(resolve => {
				chrome.runtime.sendMessage({ provider: 'wp', request: 'searchTitle', args: [term, "en", 50] }, resolve);
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
				chrome.runtime.sendMessage({ provider: 'wp', request: 'getPageById', args: [pageId, language, imageSize] }, resolve);
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
			return new Promise(resolve => {
				chrome.runtime.sendMessage({ provider: 'wp', request: 'searchResults', args: [term, "en"] }, resolve);
			});
		}
	}

	module.exports = new WikipediaAPI();

})();