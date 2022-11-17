import { Article, WikipediaThumbnail } from "../types/Interfaces";
import { StorageManager } from "../utils/StorageManager";
import { findKey as deepFindKey, identifyLanguage } from "../utils/Tools";

// const franc = require("franc");
const WKAPI = require("@g-nogueira/wikipediaapi");

export type WikipediaRepoMethodNames = "searchImage" | "searchTerm" | "getPageById";

/**
 * @summary The api for searching terms, images, and articles on Wikipedia.
 */
class WikipediaRepo {
	constructor() {}

	/**
	 * @summary Searches an image on Wikipedia by given term and size.
	 * @param {object} options
	 * @param {string} options.term The term to be searched for.
	 * @param {number} options.size The height in pixels of the image;
	 * @returns {Promise<WikipediaImage>} Returns a promise that resolves to an object with url, width, and height properties.
	 */
	async searchImage({ term, size }: { term: string; size: number }) {
		// THIS IS NEVER USED, SO IT WASN'T TESTED

		let page = await WKAPI.searchImage(term, "en", size);

		if (!page) {
			return { url: "", width: 250, height: 250 };
		}

		let image = deepFindKey("thumbnail", JSON.parse(page));

		return image;
	}

	/**
	 * @summary Searchs a single page on Wikipedia containing given term.
	 * @param {Object} options
	 * @param {string} options.term The full or partial article title to be searched for.
	 * @param {string} [options.range] A set of words in the same language as the term.
	 * @returns {Promise<Article>} Returns a promise tha resolves to an object `Article`.
	 */
	async searchTerm({ range = "", term = "", imageSize = 250 }: { term: string; range: string; imageSize: number }): Promise<Article> {
		// THIS IS NEVER USED, SO IT WASN'T TESTED

		const fallbackLang = await StorageManager.retrieve("fallbackLang");
		let nlpWhiteList = (await StorageManager.retrieve("nlpLangs")) || ["eng"];

		let lang = identifyLanguage(range.trim(), nlpWhiteList);
		lang = lang === "und" ? fallbackLang : lang;

		let page = await WKAPI.searchTitle(term, lang, imageSize);

		let data: Article = {
			title: page.title || "",
			text: page.extract || "",
			image: page.thumbnail || "",
			url: page.fullurl as URL,
		};

		return data;
	}

	/**
	 * @summary Searchs a single page on Wikipedia containing given id.
	 * @param {object} options
	 * @param {number|string} options.pageId The id of the article page.
	 * @param {string} [options.language=en] A set of words in the same language as the term.
	 * @param {number|string} [options.imageSize=250] The height of the article's image, in pixel.
	 * @returns {Promise<Article>} Returns a promise tha resolves to an object `Article`.
	 */
	async getPageById({ pageId, language = "en", imageSize = 250 }: { pageId: number; language?: string; imageSize: number }): Promise<Article> {
		let page = await WKAPI.getPageById(pageId, language, imageSize);
		let data = {
			title: page.title || "",
			text: page.extract || "",
			image: page.thumbnail || {},
			url: page.fullurl || "",
		};

		return data;
	}

	/**
	 * @summary Searchs a list of pages containing given term.
	 * @param {object} options
	 * @param {string} [options.range] A set of words in the same language as the term.
	 * @param {string} options.term The full or partial article title to be searched for.
	 * @returns {Promise<WikipediaThumbnail[]>} Returns a promise tha resolves to an object `WikipediaThumbnail`.
	 */
	async getPageList({ range = "", term } : { term: string; range: string}): Promise<WikipediaThumbnail[]> {
		let nlpWhiteList = (await StorageManager.retrieve("nlpLangs")) || ["eng"];
		let lang = identifyLanguage(range, nlpWhiteList);

		let list = await WKAPI.searchResults(term, lang, 70, false);
		let data : WikipediaThumbnail[] = [];

		if (Object.entries(list).length > 0) {
			data = list.map((page : { [key: string]: any }) => ({
				index: page.index,
				pageId: page.pageid,
				title: page.title,
				body: (page.terms && page.terms.description[0]) || "",
				image: (page.thumbnail && page.thumbnail.source) || "",
				lang: lang,
			}));
		}
		return data;
	}
}

const WKRepo = new WikipediaRepo();
export { WKRepo };
