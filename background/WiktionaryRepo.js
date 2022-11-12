(function() {
	'use strict';

	const http = require('../utils/Http');

	class WiktionaryRepo {
		constructor() {
			this.getDefinitions = this.searchTerm;
		}

		/**
		 * @summary It searches a given term on wiktionary.
		 * @param {String} obj.term The term to be searched on wiktionary.
		 * @returns {Promise.<object>} Returns a Promise that resolves to an object with ....
		 */
		searchTerm(term = '') {
			return new Promise(async (resolve, reject) => {
				const wikt = await http.get(`https://en.wiktionary.org/api/rest_v1/page/definition/${term.toLowerCase().trim()}`);
				const response = wikt;
				if (response.title) {
					resolve(undefined);
				}
				resolve(response);
			});
		}
	}

	module.exports = new WiktionaryRepo();

}());