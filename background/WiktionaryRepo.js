(() => {
	const WTAPI = require("@g-nogueira/wiktionaryapi");

	class WiktionaryRepo {
		constructor() {
			this.getDefinitions = this.searchTerm;
		}

		/**
		 * @summary It searches a given term on wiktionary.
		 * @param {String} obj.term The term to be searched on wiktionary.
		 * @returns {Promise.<object>} Returns a Promise that resolves to an object with ....
		 */
		async searchTerm(term = "") {
			let wikt = await WTAPI.searchTitle(term.toLowerCase().trim(), "en");
			if (wikt.title) {
				return undefined;
			}
			return wikt;
		}
	}

	module.exports = new WiktionaryRepo();
})();
