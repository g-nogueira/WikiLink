export interface WikilinkSchema {
	fallbackLang: string;
	popupMode: "shortcut" | "default";
	shortcut: string[];
	nlpLangs: string[];
	isEnabled: boolean;
}

// {
// 	"fallbackLang": "en",
// 	"popupMode": "shortcut",
// 	"shortcut": [
// 		"ShiftLeft",
// 		"AltLeft"
// 	],
// 	"nlpLangs": [
// 		"por",
// 		"eng",
// 		"esp",
// 		"rus"
// 	],
// 	"isEnabled": true
// }

export interface IMessage {
	provider: string;
	request: string;
	args: any;
}

export interface ExternalImage {
	source: URL;
	width: number;
	height: number;
}

export interface WikipediaThumbnail {
	/**
	 * The index number of the thumbnail in the search result set.
	 */
	index: number;
	/**
	 * The title of the thumbnail.
	 */
	title: string;
	/**
	 * The id of the article page.
	 */
	pageId: number;
	/**
	 * The text of the thumbnail.
	 */
	body: string;
	/**
	 * The language of the article.
	 */
	lang: string;
	/**
	 * The url for the image of the thumbnail.
	 */
	image: URL;
}

// export interface Article {
// 	title: string,
// 	text: string,
// 	image: string,
// }

export interface Article {
	title: string;
	text: string;
	image: ExternalImage;
	url: URL;

	// {
	//     "title": "Npm (software)",
	//     "text": "npm (originally short for Node Package Manager) is a package manager for the JavaScript programming language maintained by npm, Inc. npm is the default package manager for the JavaScript runtime environment Node.js. It consists of a command line client, also called npm, and an online database of public and paid-for private packages, called the npm registry.",
	//     "image": {
	//         "source": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Npm-logo.svg/250px-Npm-logo.svg.png",
	//         "width": 250,
	//         "height": 97
	//     },
	//     "url": "https://en.wikipedia.org/wiki/Npm_(software)"
	// }
}
export interface WiktionaryResult {
	partOfSpeech:
		| "Abbreviation"
		| "Acronym"
		| "Adjective"
		| "Adverb"
		| "Affix"
		| "AnsweringParticle"
		| "Article"
		| "AuxiliaryVerb"
		| "Character"
		| "Collocation"
		| "CombiningForm"
		| "ComparativeParticle"
		| "Conjunction"
		| "Contraction"
		| "DemonstrativePronoun"
		| "Determiner"
		| "Expression"
		| "FirstName"
		| "FocusParticle"
		| "Gismu"
		| "Hanzi"
		| "Hiragana"
		| "Idiom"
		| "IndefinitePronoun"
		| "Initialism"
		| "IntensifyingParticle"
		| "Interjection"
		| "InterrogativeAdverb"
		| "InterrogativePronoun"
		| "Kanji"
		| "Katakana"
		| "LastName"
		| "Letter"
		| "Lexeme"
		| "MeasureWord"
		| "Mnemonic"
		| "ModalParticle"
		| "NegativeParticle"
		| "Noun"
		| "NounPhrase"
		| "Number"
		| "Numeral"
		| "Onomatopoeia"
		| "Participle"
		| "Particle"
		| "PersonalPronoun"
		| "Phrase"
		| "PlaceNameEnding"
		| "PluraleTantum"
		| "PossessivePronoun"
		| "Postposition"
		| "Prefix"
		| "Preposition"
		| "Pronoun"
		| "ProperNoun"
		| "Proverb"
		| "PunctuationMark"
		| "ReflexivePronoun"
		| "RelativePronoun"
		| "Salutation"
		| "SingulareTantum"
		| "Subordinator"
		| "Suffix"
		| "Symbol"
		| "Toponym"
		| "Transliteration"
		| "Verb"
		| "WordForm";
	language: string;
	definitions: WiktionaryDefinition[];
}
export interface WiktionaryDefinition {
	definition: string;
	parsedExamples: WiktionaryParsedExample[];
}
export interface WiktionaryParsedExample {
	translation: string;
	example: string;
}