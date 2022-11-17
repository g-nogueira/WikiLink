import { WiktionaryResult } from "../types/Interfaces";

const WTAPI = require("@g-nogueira/wiktionaryapi");

export type WiktionaryRepoMethodNames = "searchTerm";


class WiktionaryRepo {
	constructor() {}

	/**
	 * @summary It searches a given term on wiktionary.
	 * @param {String} obj.term The term to be searched on wiktionary.
	 * @returns {Promise.<object>} Returns a Promise that resolves to an object with ....
	 */
	async searchTerm(term: string = ""): Promise<{ [key: string]: WiktionaryResult[] }> {
		let wikt = await WTAPI.searchTitle(term.toLowerCase().trim(), "en");
		if (wikt.title) {
			return undefined;
		}
		return wikt;
	}
}

const WTRepo = new WiktionaryRepo();

export {WTRepo};