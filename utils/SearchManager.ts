import { Article, ExternalImage, WikipediaThumbnail, WiktionaryResult } from "../types/Interfaces";
import { BackgroundCommunicator } from "./BackgroundCommunicator";

class SearchManager extends BackgroundCommunicator {
	constructor() {
		super();
	}

	/**
	 * @summary Searchs a list of pages containing given term.
	 * @param {string} [range] A set of words in the same language as the term.
	 * @param {string} term The full or partial article title to be searched for.
	 */
	async searchTerm(term: string, range: string): Promise<{ pages: WikipediaThumbnail[]; definitions: { [key: string]: WiktionaryResult[] } }> {
		let pageList: WikipediaThumbnail[] = await this.sendMessage({ provider: "wp", request: "getPageList", args: { range, term } });
		let wiktionary: { [key: string]: WiktionaryResult[] } = await this.sendMessage({ provider: "wt", request: "searchTerm", args: term });

		return {
			pages: pageList,
			definitions: wiktionary,
		};
	}

	/**
	 * @summary Searchs a single page on Wikipedia containing given id.
	 * @param {object} options
	 * @param {number|string} options.pageId The id of the article page.
	 * @param {string} [options.language=en] A set of words in the same language as the term.
	 * @param {number|string} [options.imageSize=250] The height of the article's image, in pixel.
	 */
	async getArticle(pageId: string, language = "en", imageSize = 250): Promise<Article> {
		let article: Article = await this.sendMessage({ provider: "wp", request: "getPageById", args: { pageId, language, imageSize } });

		return article;
	}

	/**
	 * @summary Searches a given term definition.
	 * @param {String} obj.term The term to be searched.
	 */
	async getDefinitions(term: string): Promise<{ [key: string]: WiktionaryResult[] }> {
		let wiktionary: { [key: string]: WiktionaryResult[] } = await this.sendMessage({ provider: "wt", request: "searchTerm", args: term });

		return wiktionary;
	}
}

export const Search = new SearchManager();

// {
//     "en": [
//         {
//             "partOfSpeech": "Noun",
//             "language": "English",
//             "definitions": [
//                 {
//                     "definition": "A tree of the genus <i><a rel=\"mw:WikiLink\" href=\"/wiki/Mora#Translingual\" title=\"Mora\" about=\"#mwt5\" typeof=\"mw:Transclusion\">Mora</a></i>"
//                 },
//                 {
//                     "definition": "The wood of such trees"
//                 }
//             ]
//         }
//     ],
//     "fi": [
//         {
//             "partOfSpeech": "Noun",
//             "language": "Finnish",
//             "definitions": [
//                 {
//                     "definition": "<a rel=\"mw:WikiLink\" href=\"/wiki/sister-in-law\" title=\"sister-in-law\">sister-in-law</a> of a woman <span class=\"gloss-brac\" about=\"#mwt14\" typeof=\"mw:Transclusion\">(</span><span class=\"gloss-content\" about=\"#mwt14\">husband's sister</span><span class=\"gloss-brac\" about=\"#mwt14\">)</span>"
//                 }
//             ]
//         },
//         {
//             "partOfSpeech": "Noun",
//             "language": "Finnish",
//             "definitions": [
//                 {
//                     "definition": "<span class=\"form-of-definition use-with-mention\" about=\"#mwt24\" typeof=\"mw:Transclusion\">Alternative spelling of <span class=\"form-of-definition-link\"><i class=\"Latn mention\" lang=\"fi\"><a rel=\"mw:WikiLink\" href=\"/wiki/NATO#Finnish\" title=\"NATO\">NATO</a></i></span></span>."
//                 }
//             ]
//         }
//     ],
//     "other": [
//         {
//             "partOfSpeech": "Noun",
//             "language": "Ingrian",
//             "definitions": [
//                 {
//                     "definition": "<a rel=\"mw:WikiLink\" href=\"/wiki/sister-in-law\" title=\"sister-in-law\">sister-in-law</a>"
//                 }
//             ]
//         },
//         {
//             "partOfSpeech": "Adjective",
//             "language": "Istriot",
//             "definitions": [
//                 {
//                     "definition": "<a rel=\"mw:WikiLink\" href=\"/wiki/born\" title=\"born\">born</a>"
//                 }
//             ]
//         }
//     ],
//     "it": [
//         {
//             "partOfSpeech": "Participle",
//             "language": "Italian",
//             "definitions": [
//                 {
//                     "definition": "<span class=\"form-of-definition use-with-mention\" about=\"#mwt41\" typeof=\"mw:Transclusion\"><a rel=\"mw:WikiLink\" href=\"/wiki/Appendix:Glossary#past_tense\" title=\"Appendix:Glossary\">past</a> <a rel=\"mw:WikiLink\" href=\"/wiki/Appendix:Glossary#participle\" title=\"Appendix:Glossary\">participle</a> of <span class=\"form-of-definition-link\"><i class=\"Latn mention\" lang=\"it\"><a rel=\"mw:WikiLink\" href=\"/wiki/nascere#Italian\" title=\"nascere\">nascere</a></i></span></span><link rel=\"mw:PageProp/Category\" href=\"./Category:Italian_past_participles#NATO\" about=\"#mwt41\">; <a rel=\"mw:WikiLink\" href=\"/wiki/born\" title=\"born\">born</a>"
//                 }
//             ]
//         },
//         {
//             "partOfSpeech": "Adjective",
//             "language": "Italian",
//             "definitions": [
//                 {
//                     "definition": "<a rel=\"mw:WikiLink\" href=\"/wiki/born\" title=\"born\">born</a> (also used in combination)"
//                 },
//                 {
//                     "definition": "<a rel=\"mw:WikiLink\" href=\"/wiki/né\" title=\"né\">né</a>"
//                 }
//             ]
//         },
//         {
//             "partOfSpeech": "Verb",
//             "language": "Italian",
//             "definitions": [
//                 {
//                     "definition": "<span class=\"form-of-definition use-with-mention\" about=\"#mwt48\" typeof=\"mw:Transclusion\"><a rel=\"mw:WikiLink\" href=\"/wiki/Appendix:Glossary#first_person\" title=\"Appendix:Glossary\">first-person</a> <a rel=\"mw:WikiLink\" href=\"/wiki/Appendix:Glossary#singular_number\" title=\"Appendix:Glossary\">singular</a> <a rel=\"mw:WikiLink\" href=\"/wiki/Appendix:Glossary#present_tense\" title=\"Appendix:Glossary\">present</a> <a rel=\"mw:WikiLink\" href=\"/wiki/Appendix:Glossary#indicative_mood\" title=\"Appendix:Glossary\">indicative</a> of <span class=\"form-of-definition-link\"><i class=\"Latn mention\" lang=\"it\"><a rel=\"mw:WikiLink\" href=\"/wiki/natare#Italian\" title=\"natare\">natare</a></i></span></span>"
//                 }
//             ]
//         }
//     ],
//     "la": [
//         {
//             "partOfSpeech": "Verb",
//             "language": "Latin",
//             "definitions": [
//                 {
//                     "definition": "<a rel=\"mw:WikiLink\" href=\"/wiki/swim\" title=\"swim\">swim</a>, <a rel=\"mw:WikiLink\" href=\"/wiki/float\" title=\"float\">float</a>",
//                     "parsedExamples": [
//                         {
//                             "translation": "When <b>swimming</b> in the lake, he saw many fish.",
//                             "example": "<i>Cum in lacū <b>natābat</b>, multōs piscēs vīdit.</i>"
//                         }
//                     ],
//                     "examples": [
//                         "<i>Cum in lacū <b>natābat</b>, multōs piscēs vīdit.</i>"
//                     ]
//                 },
//                 {
//                     "definition": "(especially of the eyes) to <a rel=\"mw:WikiLink\" href=\"/wiki/swim\" title=\"swim\">swim</a> (as when drunken or dying); to be <a rel=\"mw:WikiLink\" href=\"/wiki/feeble\" title=\"feeble\">feeble</a>, <a rel=\"mw:WikiLink\" href=\"/wiki/failing\" title=\"failing\">failing</a>; to <a rel=\"mw:WikiLink\" href=\"/wiki/fluctuate\" title=\"fluctuate\">fluctuate</a>, <a rel=\"mw:WikiLink\" href=\"/wiki/waver\" title=\"waver\">waver</a>, be <a rel=\"mw:WikiLink\" href=\"/wiki/uncertain\" title=\"uncertain\">uncertain</a>, <a rel=\"mw:WikiLink\" href=\"/wiki/unsteady\" title=\"unsteady\">unsteady</a>; to move to and fro, not stand still"
//                 },
//                 {
//                     "definition": "<a rel=\"mw:WikiLink\" href=\"/wiki/stream\" title=\"stream\">stream</a>, <a rel=\"mw:WikiLink\" href=\"/wiki/flow\" title=\"flow\">flow</a>"
//                 }
//             ]
//         },
//         {
//             "partOfSpeech": "Participle",
//             "language": "Latin",
//             "definitions": [
//                 {
//                     "definition": "<span class=\"form-of-definition use-with-mention\" about=\"#mwt154\" typeof=\"mw:Transclusion\"><span class=\"inflection-of-conjoined\"><a rel=\"mw:WikiLink\" href=\"/wiki/Appendix:Glossary#dative_case\" title=\"Appendix:Glossary\">dative</a><span class=\"inflection-of-sep\">/</span><a rel=\"mw:WikiLink\" href=\"/wiki/Appendix:Glossary#ablative_case\" title=\"Appendix:Glossary\">ablative</a></span> <span class=\"inflection-of-conjoined\"><a rel=\"mw:WikiLink\" href=\"/wiki/Appendix:Glossary#gender\" title=\"Appendix:Glossary\">masculine</a><span class=\"inflection-of-sep\">/</span><a rel=\"mw:WikiLink\" href=\"/wiki/Appendix:Glossary#gender\" title=\"Appendix:Glossary\">neuter</a></span> <a rel=\"mw:WikiLink\" href=\"/wiki/Appendix:Glossary#singular_number\" title=\"Appendix:Glossary\">singular</a> of <span class=\"form-of-definition-link\"><i class=\"Latn mention\" lang=\"la\"><a rel=\"mw:WikiLink\" href=\"/wiki/natus#Latin\" title=\"natus\">nātus</a></i></span></span>"
//                 }
//             ]
//         }
//     ],
//     "pt": [
//         {
//             "partOfSpeech": "Adjective",
//             "language": "Portuguese",
//             "definitions": [
//                 {
//                     "definition": "<a rel=\"mw:WikiLink\" href=\"/wiki/born\" title=\"born\">born</a> <span class=\"gloss-brac\" about=\"#mwt167\" typeof=\"mw:Transclusion\">(</span><span class=\"gloss-content\" about=\"#mwt167\">having a character or quality from birth</span><span class=\"gloss-brac\" about=\"#mwt167\">)</span>",
//                     "parsedExamples": [
//                         {
//                             "example": "Ela é uma escritora <b>nata</b>.",
//                             "translation": "She is a <b>born</b> writer."
//                         }
//                     ],
//                     "examples": [
//                         "Ela é uma escritora <b>nata</b>."
//                     ]
//                 },
//                 {
//                     "definition": "<a rel=\"mw:WikiLink\" href=\"/wiki/innate\" title=\"innate\">innate</a> <span class=\"gloss-brac\" about=\"#mwt171\" typeof=\"mw:Transclusion\">(</span><span class=\"gloss-content\" about=\"#mwt171\">present from birth</span><span class=\"gloss-brac\" about=\"#mwt171\">)</span>",
//                     "parsedExamples": [
//                         {
//                             "example": "Sua criatividade é <b>nata</b>.",
//                             "translation": "Your creativity is <b>innate</b>."
//                         }
//                     ],
//                     "examples": [
//                         "Sua criatividade é <b>nata</b>."
//                     ]
//                 },
//                 {
//                     "definition": "born in a place (often implying strong identification with the location or local culture)",
//                     "parsedExamples": [
//                         {
//                             "example": "Ele é nordestino <b>nato</b>!",
//                             "translation": "He is a <b>born and bred</b> Northeasterner!"
//                         }
//                     ],
//                     "examples": [
//                         "Ele é nordestino <b>nato</b>!"
//                     ]
//                 },
//                 {
//                     "definition": "by birth <span class=\"gloss-brac\" about=\"#mwt177\" typeof=\"mw:Transclusion\">(</span><span class=\"gloss-content\" about=\"#mwt177\">having a nationality due to being born in the country</span><span class=\"gloss-brac\" about=\"#mwt177\">)</span>",
//                     "parsedExamples": [
//                         {
//                             "example": "Somos brasileiros <b>natos</b>, mas nosso avó foi naturalizado.",
//                             "translation": "We are Brazilians <b>by birth</b>, but our grandfather was naturalised."
//                         }
//                     ],
//                     "examples": [
//                         "Somos brasileiros <b>natos</b>, mas nosso avó foi naturalizado."
//                     ]
//                 }
//             ]
//         }
//     ],
//     "es": [
//         {
//             "partOfSpeech": "Adjective",
//             "language": "Spanish",
//             "definitions": [
//                 {
//                     "definition": "<a rel=\"mw:WikiLink\" href=\"/wiki/born\" title=\"born\">born</a>"
//                 }
//             ]
//         }
//     ]
// }
