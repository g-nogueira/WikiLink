// import {franc, francAll} from 'franc'
const franc = require("franc");

/**
 * @summary Deep searches given key in the given object.
 * @param {object} obj The object to be deep searched.
 * @param {string} key The key to deep search in the object.
 *
 */
 export function findKey(key : string, obj : {[key: string]: any }) : any{
	return keyToFind(key);

	function keyToFind(key : string) {
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
export function identifyLanguage(extract: string, langs: string[] = ["eng"]) {
	// Rupestre painting of the start of a code to detect the language.
	// var testUTF8 = /([^\u0000-\u0040\u005B-\u0060\u007B-\u00BF\u02B0-\u036F\u00D7\u00F7\u2000-\u2BFF])+/g;
	// var testDiacritics = /[\u00C0-\u00FF]/g;
	// var text = extract && extract.match(testUTF8).toString();
	// var isDiacritic = testDiacritics.test(text);

	var languages: {[key: string] : string} = {
		por: "pt",
		eng: "en",
		spa: "es",
		rus: "ru",
	};

	if (langs.length === 1) {
		return languages[langs[0]];
	} else {
		let francRes = franc(extract, { only: langs });
		return languages[francRes] || "en";
	}
}