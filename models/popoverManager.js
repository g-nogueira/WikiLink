(() => {
	'use strict';

	module.exports = popoverManager;

	/**
	 * A popover DOM management API
	 * @param {HTMLElement} popover 
	 */
	function popoverManager(popover) {

		/**
		 * The Popover element used in the manager dispatches some events:
		 * - "tabselect" - When the user clicks on a tab (List, Wikipedia, or Wiktionary),
		 * - "popoverHidden" - When the popover has finished the hidden process,
		 * - "thumbclick" - When the user selects an article of the search response list,
		 * - "pagechange" - When a change of page occurs, independent of the trigger,
		 */
		class Popover {
			constructor(popover) {

				if (!popover)
					throw new ReferenceError('It is required to indicate a popover element for this function to work properly.')

				if (!(popover instanceof HTMLElement))
					throw new TypeError('The given popover is not a instance of HTMLElement');


				this.thumbnailImageNotFoundUrl;
				this.wikipediaImageNotFoundUrl;


				this.HTMLElement = popover;
				this.sections = this.popoverElements();
				this.setThumbnails = this.insertThumbnails;
				this.setArticle = (article) => insertArticle(article, this.wikipediaImageNotFoundUrl);
				this.setDictionary = insertDictionary;
				this.isLoading = insertBlankData;
				this.addEventListener = (eventName, eventListener) => popover.addEventListener(eventName, eventListener);

				this.createCustomEvents();
				// popover.addEventListener('show.bs.tab', ev => loadTab(ev.target));
			}

			insertThumbnails(thumbs = []) {
				if (!thumbs.length) {
					popover = setThumbsError();
				} else {
					const thumbsSect = popover.querySelector('#tabResultList ul');
					const thumbnails = thumbnailsToHtml(thumbs, this.thumbnailImageNotFoundUrl);

					thumbnails.querySelectorAll('.js-item').forEach(thumbnail => {
						if (thumbnail) {
							let thumbnailClick = new CustomEvent('thumbclick', {
								bubbles: true,
								detail: {
									article: {
										id: thumbnail.id,
										lang: thumbnail.dataset.lang,
										title: thumbnail.querySelector("#title-" + thumbnail.id).textContent
									}
								}
							});

							thumbnail.addEventListener('click', ev => popover.dispatchEvent(thumbnailClick));
						}
					});

					removeChildrenFrom(thumbsSect);
					thumbsSect.appendChild(thumbnails);
				}

				return popover;
			}

			popoverElements() {

				return {
					resultsTab: popover.querySelector('.js-listTab'),
					wikiTab: popover.querySelector('.js-wikiTab'),
					wiktTab: popover.querySelector('.js-wiktTab'),
					listWrapper: popover.querySelector('#tabResultList ul'),
					wikipediaWrapper: popover.querySelector('#tabWikipedia'),
					wiktionaryWrapper: popover.querySelector('#tabWiktionary'),
				}
			}

			createCustomEvents() {


				popover.querySelectorAll('.js-tab').forEach(tab => tab.addEventListener('click', ev => {
					const tabSelect = new CustomEvent('tabselect', {
						bubbles: true,
						detail: {
							target: ev.currentTarget.attributes.getNamedItem('target').value,
							element: ev.target
						}
					});

					popover.dispatchEvent(tabSelect);
				}));
			}
		}

		return new Popover(popover);



		function setThumbsError() {
			var thumbWrapper = popover.querySelector('#tabResultList ul');

			removeChildrenFrom(thumbWrapper);
			thumbWrapper.appendChild(document.createTextNode(`Didn't find any info 😕`));

			return popover;
		}

		/**
		 * 
		 * @param {Object} articleObj
		 * @param {String} articleObj.extract
		 * @param {String} articleObj.fullurl
		 * @param {String} articleObj.pagelanguage
		 * @param {Object} articleObj.thumbnail
		 * @param {Number} articleObj.thumbnail.height
		 * @param {String} articleObj.thumbnail.source
		 * @param {Number} articleObj.thumbnail.width
		 */
		function insertArticle(articleObj, wikipediaImageNotFoundUrl) {

			var wikiSect = popover.querySelector('#tabWikipedia');
			var content = wikipediaArticle({
				title: articleObj.title,
				text: articleObj.extract,
				image: articleObj.thumbnail,
				url: articleObj.fullurl
			}, wikipediaImageNotFoundUrl);

			var imageElem = content.querySelector('.js-articleImage');

			$(wikiSect.querySelector("#tabWikipedia")).tab("show");
			removeChildrenFrom(wikiSect);

			imageElem.onload = () => {
				let img = imageElem;
				let minHeight = 200;
				let scale = minHeight / img.naturalWidth;

				img.style.height = `${img.naturalHeight * scale}px`;
				img.style.width = `${img.naturalWidth * scale}px`;
				if (img.height < minHeight && content.clientHeight <= minHeight) {
					wikiSect.setAttribute('style', `max-height: ${content.clientHeight}px;`);
					wikiSect.setAttribute('style', `min-height: ${content.clientHeight}px;`);
				} else if (img.height >= 200) {
					wikiSect.setAttribute('style', `min-height: ${img.height}px;`);
					wikiSect.setAttribute('style', `max-height: ${img.height}px;`);
				}
			};
			wikiSect.appendChild(content);

			return popover;
		}

		function insertBlankData({ area = '' }) {

			var wikiSect = popover.querySelector('#tabWikipedia');
			var thumbWrapper = popover.querySelector('#tabResultList ul');

			var areaToDisplay = {
				thumbnails: () => {
					removeChildrenFrom(thumbWrapper);
					thumbWrapper.appendChild(blankThumbnails());
				},
				wiktionary: () => {

				},
				article: () => {
					$(wikiSect.querySelector("#tabWikipedia")).tab("show");
					const previousArticle = wikiSect.querySelector('.js-wikiArticle');
					if (previousArticle)
						wikiSect.removeChild(previousArticle)

					wikiSect.appendChild(blankArticle());
				}
			};
			try {
				areaToDisplay[area]();
			} catch (error) {

			}
			return popover;
		}

		function insertDictionary(data) {
			var wiktWrapper = popover.querySelector('#tabWiktionary');
			var wiktWrapper = removeChildrenFrom(wiktWrapper);

			if (data) {
				wiktWrapper.appendChild(wiktionaryArticle(data));
			}

		}

		/**
		 * Generates the Wiktionary content based on given data.
		 * @param {object} article The data to use as the article.
		 * @returns {DocumentFragment} The dictionary section to be inserted on the popover.
		 */
		function wiktionaryArticle(article) {

			var section = document.createDocumentFragment();
			var template = document.querySelector("#partOfSpeechItem");

			for (const entry of Object.entries(article)) {
				try {
					var partsOfSpeech = entry[1]
					var language = entry[1][0].language;

					const span = newElement('span', `s${uniqueId()}`, ['dict-lang'])
					const ul = newElement('ul', '', ['dict-lang--sections']);

					for (const group of partsOfSpeech) {

						let partOfSpeechItem = template.content.cloneNode(true);

						partOfSpeechItem.firstElementChild.id = "li" + uniqueId();
						partOfSpeechItem.querySelector("span").innerText = group.partOfSpeech;

						for (const def of group.definitions) {

							const wordDefinition = newElement('li');
							wordDefinition.innerText = def.definition.replace(/(<script(\s|\S)*?<\/script>)|(<style(\s|\S)*?<\/style>)|(<!--(\s|\S)*?-->)|(<\/?(\s|\S)*?>)/g, '');
							partOfSpeechItem.querySelector('#dictDefs').appendChild(wordDefinition);

						}

						span.innerText = language;
						ul.appendChild(partOfSpeechItem);
						section.appendChild(span);
						section.appendChild(ul);
					}

				} catch (error) {
					throw new Error("Wiktionary didn't return a valid response");
				}
			}


			return section;
		}

		/**
		 * Generates the Wikipedia content based on given data.
		 * @param {string} text The article's text.
		 * @returns {object} text The article's image data (source).
		 */
		function wikipediaArticle({ title, text, image, url }, imageNotFoundUrl) {
			var originalWord = (() => {
				let loweredText = text.toLowerCase();
				let loweredTitle = title.toLowerCase();
				let startIndex = loweredText.search(loweredTitle);
				let endIndex = startIndex + title.length;
				return text.substring(startIndex, endIndex)
			})();

			var template = document.querySelector("#wikipediaArticle");
			var node = template.content.cloneNode(true);

			let inputImg = node.querySelector("img");
			let inputText = node.querySelector("p");

			var formatedText = text.replace(originalWord, `<strong><a href="${url}" target="_blank" rel="noopener noreferrer" title="View on Wikipedia">${originalWord}</a></strong>`)

			inputImg.src = image.source || imageNotFoundUrl;
			inputText.innerHTML = formatedText;


			return node;
		}

		/**
		 * Generates a blank Wikipedia's article.
		 * @param {number} paragraphsCount The number of paragraphs.
		 */
		function blankArticle(paragraphsCount = 8) {
			var section = document.createDocumentFragment();
			var paragraphs = "";


			for (let p = 0; p < paragraphsCount; p++) {
				paragraphs = paragraphs.concat('<div class="description--blank"></div>');
			}

			let frag = `
                <div id="wikiArticle" class="js-wikiArticle wikiArticle--blank">
                    <div id="popoverImage" class="popoverImage--blank"></div>
					<section class="text--blank">${paragraphs}</section>
                </>
                `;

			return section.appendChild(document.createRange().createContextualFragment(frag).firstElementChild);
		}

		/**
		 * Converts a raw object list to Wikipedia's thumbails.
		 * @param {object} thumbList The data returned from the wiktionary.
		 * @returns {DocumentFragment} The list of thumbnails.
		 */
		function thumbnailsToHtml(thumbList, imageNotFoundUrl) {

			var section = document.createDocumentFragment();
			let template = document.querySelector("#listGroupItem");

			thumbList
				.map((listItem) => {

					let listGroupItem = template.content.cloneNode(true);
					let inputDescription = listGroupItem.querySelector("#description-");
					let inputTitle = listGroupItem.querySelector("#title-");
					let inputImg = listGroupItem.querySelector("img");


					listGroupItem.firstElementChild.id = listItem.pageid;
					listGroupItem.firstElementChild.dataset.lang = listItem.lang;

					inputTitle.id += listItem.pageid;
					inputDescription.id += listItem.pageid;

					inputImg.src = listItem.thumbnail.source || imageNotFoundUrl;
					inputTitle.innerText = listItem.title;
					inputDescription.innerText = listItem.terms && listItem.terms.description[0];



					return listGroupItem;

				})
				.forEach(thumbnail => section.appendChild(thumbnail));

			return section;
		}

		function blankThumbnails(quantity = 6) {

			var section = document.createDocumentFragment();
			let template = document.querySelector("#blankListGroupItem");


			for (let i = 0; i < quantity; i++) {
				let listGroupItem = template.content.cloneNode(true);
				section.appendChild(listGroupItem);
			}

			return section;
		}

		function removeChildrenFrom(element) {
			while (element.hasChildNodes()) {
				element.removeChild(element.lastChild);
			}

			return element;
		}

		function uniqueId() {
			return (new Date()).getTime();
		}

		/**
		 * Disables a tab by given id.
		 * @param {number} tabId  The id of the tab to be disabled (1: Wikipedia | 2: Wiktionary).
		 */
		function disableTab(tabId) {
			var tabs = {
				1: '.js-wikiTab',
				2: '.js-wiktTab'
			}
			popover.querySelector(tabs[tabId]).setAttribute('disabled', 'disabled');
		}

		function newElement(element = 'div', id = '', classList = []) {
			var el = document.createElement(element);
			el.id = id || el.id;
			if (classList.length) {
				el.classList.add(classList);
			}

			return el;
		}
	}
})();