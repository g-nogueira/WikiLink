(() => {
	'use strict';

	class WiktionaryAPI {
		constructor() {
			this.getDefinitions = this.searchTerm;
		}

		/**
		 * @summary It searches a given term on wiktionary.
		 * @param {String} obj.term The term to be searched on wiktionary.
		 * @returns {Promise<object>} Returns a Promise that resolves to an object with ....
		 */
		searchTerm(term = '') {
			return new Promise(async resolve => {
				chrome.runtime.sendMessage({ provider: 'wt', request: 'searchTerm', args: term }, resolve);
			});
		}
	}

	module.exports = new WiktionaryAPI();

})();