'use strict';

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


			this.HTMLElement = popover;
			this.sections = popoverElements();
			this.hide = hidePopover;
			this.render = appendPopover;
			this.setThumbnails = insertThumbnails;
			this.setArticle = insertArticle;
			this.setDictionary = insertDictionary;
			this.isLoading = insertBlankData;
			this.isChild = isPopoverChild;
			this.showPage = showPage;
			this.addEventListener = (eventName, eventListener) => popover.addEventListener(eventName, eventListener);

			popover.addEventListener('tabselect', ev => showPage(ev.detail.target, !isDisabled(ev.detail.element)));
			popover.addEventListener('popoverHidden', ev => disableTab(1));
			popover.addEventListener('thumbclick', ev => enableTab(1));
			popover.addEventListener('pagechange', ev => {
				if (ev.detail.element === this.sections.wikipediaWrapper || ev.detail.element === this.sections.wiktionaryWrapper) {
					showElements(this.sections.resultsTab);
				} else {
					hideElements(this.sections.resultsTab);
				}
			});
		}
	}

	return new Popover(popover);

	function popoverElements() {
		return {
			resultsTab: popover.querySelector('.js-listTab'),
			wikiTab: popover.querySelector('.js-wikiTab'),
			wiktTab: popover.querySelector('.js-wiktTab'),
			listWrapper: popover.querySelector('.js-wikiSearches'),
			wikipediaWrapper: popover.querySelector('.js-wikiSect'),
			wiktionaryWrapper: popover.querySelector('.js-wiktSect'),
		}
	}

	function insertThumbnails(thumbs = []) {
		if (!thumbs.length) {
			popover = setThumbsError();
		} else {
			const thumbsSect = popover.querySelector('.js-wikiSearches');
			const thumbnails = thumbnailsToHtml(thumbs);

			thumbnails.querySelectorAll('.js-item').forEach(thumbnail => {
				if (thumbnail) {
					let thumbnailClick = new CustomEvent('thumbclick', {
						bubbles: true,
						detail: {
							article: {
								id: thumbnail.id,
								lang: thumbnail.attributes.getNamedItem('lang').value,
								title: thumbnail.querySelector('.js-title').textContent
							}
						}
					});

					thumbnail.addEventListener('click', ev => popover.dispatchEvent(thumbnailClick));
				}
			})
			removeChildrenFrom(thumbsSect);
			thumbsSect.appendChild(thumbnails);
		}

		return popover;
	}

	function setThumbsError() {
		var thumbWrapper = popover.querySelector('.js-wikiSearches');

		removeChildrenFrom(thumbWrapper);
		thumbWrapper.appendChild(document.createTextNode(`Didn't find any info 😕`));

		return popover;
	}

	function insertArticle({ text, image }) {

		var wikiSect = popover.querySelector('.js-wikiSect');
		var content = wikipediaArticle(text, image);
		var imageElem = content.querySelector('.js-articleImage');


		showPage('js-wikiSect');
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

		var wikiSect = popover.querySelector('.js-wikiSect');
		var thumbWrapper = popover.querySelector('.js-wikiSearches');

		var areaToDisplay = {
			thumbnails: () => {
				removeChildrenFrom(thumbWrapper);
				thumbWrapper.appendChild(blankThumbnails());
			},
			wiktionary: () => {

			},
			article: () => {
				showPage('js-wikiSect');
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
		var wiktWrapper = popover.querySelector('.js-wiktSect');
		var wiktWrapper = removeChildrenFrom(wiktWrapper);

		if (data) {
			wiktWrapper.appendChild(wiktionaryArticle(data));
			enableTab(2);
		} else {
			disableTab(2);
		}

	}

	/**
	 * Generates the Wiktionary content based on given data.
	 * @param {object} article The data to use as the article.
	 * @returns {DocumentFragment} The dictionary section to be inserted on the popover.
	 */
	function wiktionaryArticle(article) {

		var section = document.createDocumentFragment();

		Object.entries(article).forEach(entrie => { //foreach language
			try {
				var partsOfSpeech = entrie[1]
				var language = entrie[1][0].language;

				const span = newElement('span', `s${uniqueId()}`, ['dict-lang'])
				const ul = newElement('ul', '', ['dict-lang--sections']);

				partsOfSpeech.forEach(group => {

					const liPoS = document.createRange().createContextualFragment(`
                    	<li id="\`li${uniqueId()}\`">
                    	    <span class="dict-partofspeach">${group.partOfSpeech}</span>
                    	    <ol type="1" id="dictDefs" class="dict-definition">
                    	    </ol>
                    	</li>`);


					group.definitions.forEach(def => {
						const wordDefinition = newElement('li');
						wordDefinition.innerText = def.definition.replace(/(<script(\s|\S)*?<\/script>)|(<style(\s|\S)*?<\/style>)|(<!--(\s|\S)*?-->)|(<\/?(\s|\S)*?>)/g, '');
						liPoS.querySelector('#dictDefs').appendChild(wordDefinition);
					});

					span.innerText = language;
					ul.appendChild(liPoS);
					section.appendChild(span);
					section.appendChild(ul);


				});
			} catch (error) {
				disableTab(2);
			}
		});

		return section;
	}

	/**
	 * Generates the Wikipedia content based on given data.
	 * @param {string} text The article's text.
	 * @returns {object} text The article's image data (source).
	 */
	function wikipediaArticle(text, image) {
		var section = document.createDocumentFragment();
		let frag = `
                <div id="wikiArticle" class="js-wikiArticle">
                    <img id="popoverImage" class="popoverImage js-articleImage" src="${image.source || 'https://raw.githubusercontent.com/g-nogueira/WikiLink/master/public/images/404/01image404--200.png'}">
                    <p class="js-wikiInfo popoverText">${text}</p>
                </div>
                `;

		return section.appendChild(document.createRange().createContextualFragment(frag).firstElementChild);
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
	function thumbnailsToHtml(thumbList) {

		var section = document.createDocumentFragment();

		thumbList
			.map(thumbnailToHtml)
			.forEach(thumbnail => section.appendChild(thumbnail));

		return section;
	}

	function thumbnailToHtml(rawTag) {
		try {
			var thumbnail = `
                <div id="${rawTag.pageId}" lang="${rawTag.lang}" class="js-item item">
                    <section class="image">
                        <img src="${rawTag.img || "https://raw.githubusercontent.com/g-nogueira/WikiLink/master/public/images/404/01image404--70.png"}" alt="">
                    </section>
                    <section class="info">
                        <div class="js-title title">${rawTag.title}</div>
                        <div class="description">${rawTag.body}</div>
                    </section>
				</div>`;
		} catch (error) {
			var thumbnail = `<div></div>`;
		}
		return newFragment(thumbnail).firstElementChild;
	}

	function blankThumbnails(quantity = 6) {

		var section = document.createDocumentFragment();

		for (let i = 0; i < quantity; i++) {
			let frag = `
                <div class="js-item item item--blank">
                    <section class="image--blank"></section>
                    <section class="info">
                        <div class="js-title title--blank"></div>
                        <div class="description--blank"></div>
                        <div class="description--blank"></div>
                    </section>
                </div>`;

			section.appendChild(document.createRange().createContextualFragment(frag).firstElementChild);
		}

		return section;
	}

	/**
	 * Displays the popover based on given selection, cal1 and cal2 coordinates.
	 * @param {Selection} selection The current window selection on DOM.
	 * @param {*} cal1 
	 * @param {*} cal2 
	 */
	function appendPopover(selection, cal1, cal2) {
		/**From:
		 * https://stackoverflow.com/questions/39283159/how-to-keep-selection-but-also-press-button
		 */
		var selRange = selection.getRangeAt(0).getBoundingClientRect();
		var rb1 = DOMRect(cal1);
		var rb2 = DOMRect(cal2);

		popover.style.top = `${(selRange.bottom - rb2.top) * 100 / (rb1.top - rb2.top)}px`;
		let leftPosition = calcLeftPos(selRange, rb1, rb2);

		if (leftPosition + popover.clientWidth > window.innerWidth) {
			// popover.attributeStyleMap.set('left', CSS.px(leftPosition) - popover.clientWidth + selRange.width);
			popover.style.left = `${calcLeftPos(selRange, rb1, rb2) - popover.clientWidth + selRange.width}px`
		} else {
			// popover.attributeStyleMap.set('left', CSS.px((selRange.left - rb2.left) * 100 / (rb1.left - rb2.left)));
			popover.style.left = `${(selRange.left - rb2.left) * 100 / (rb1.left - rb2.left)}px`;
		}

		popover.classList.add('popover--enabled');

		function DOMRect(element) {
			const r = document.createRange()
			r.selectNode(element)
			return r.getBoundingClientRect();
		}

		function calcLeftPos(selRange, rb1, rb2) {
			return (selRange.left - rb2.left) * 100 / (rb1.left - rb2.left);
		}

		popover
			.querySelectorAll('.js-tab')
			.forEach(tab => tab.addEventListener('click', ev => {
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

	function removeChildrenFrom(element) {
		while (element.hasChildNodes()) {
			element.removeChild(element.lastChild);
		}

		return element;
	}

	function isPopoverChild(elemIdentifier = '') {
		try {
			return popover.querySelector(elemIdentifier) === null ? false : true;
		} catch (error) {
			return false;
		}
	}

	/**
	 * @param {number} delay The delay in milliseconds to hide the popover.
	 */
	function hidePopover(delay = 300) {
		setTimeout(() => {
			popover.classList.remove('popover--enabled');
			const hideEvent = new CustomEvent('popoverHidden', {
				bubbles: true,
				detail: {
					element: popover,
				}
			});

			popover.dispatchEvent(hideEvent);
		}, delay);
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
		popover.querySelector(tabs[tabId]).setAttribute('disabled', 'disabled');;
	}

	/**
	 * Enables a tab by given id.
	 * @param {number} tabId  The id of the tab to be enabled (1: Wikipedia | 2: Wiktionary).
	 */
	function enableTab(tabId) {
		var tabs = {
			1: '.js-wikiTab',
			2: '.js-wiktTab'
		}
		if (popover.querySelector(tabs[tabId]).hasAttribute('disabled')) {
			popover.querySelector(tabs[tabId]).removeAttribute('disabled');
		}
	}

	function newFragment(codeString = '<div></div>') {
		return document.createRange().createContextualFragment(codeString);
	}

	function isDisabled(element) {
		return element.hasAttribute('disabled');
	}

	function hideElements(identifier = '') {

		if (identifier instanceof HTMLElement) {

			identifier.classList.add('hidden');

		} else if (identifier instanceof NodeList) {

			identifier.forEach(el => el.classList.add('hidden'));

		} else if (Array.isArray(identifier)) {

			identifier.forEach(el => {
				popover.querySelectorAll(el).forEach(el => el.classList.add('hidden'));
			});

		} else if (typeof identifier === "string") {
			
			popover.querySelectorAll(identifier).forEach(el => el.classList.add('hidden'));
		}
	}

	function showElements(identifier = '') {
		if (identifier instanceof HTMLElement) {

			identifier.classList.remove('hidden');

		} else if (identifier instanceof NodeList) {

			identifier.forEach(el => el.classList.remove('hidden'));

		} else if (Array.isArray(identifier)) {

			identifier.forEach(el => {
				popover.querySelectorAll(el).forEach(el => el.classList.remove('hidden'));
			});

		} else if (typeof identifier === "string") {

			popover.querySelectorAll(identifier).forEach(el => el.classList.remove('hidden'));
		}


	}

	function newElement(element = 'div', id = '', classList = []) {
		var el = document.createElement(element);
		el.id = id || el.id;
		if (classList.length) {
			el.classList.add(classList);
		}

		return el;
	}

	function showPage(pageClass, condition = true) {
		if (condition) {
			var className = pageClass.match(/([^.].+)/g)[0];
			var previousPage;
			popover.querySelectorAll('.js-infoSect').forEach(section => {
				if (!section.classList.contains('hidden'))
					previousPage = section;
				if (!section.classList.contains(className)) {
					hideElements(section);
				} else {
					section.classList.remove('hidden');
					const changePageEvent = new CustomEvent('pagechange', {
						bubbles: true,
						detail: {
							className: className,
							element: section,
							previous: previousPage
						}
					});

					popover.dispatchEvent(changePageEvent);
				}
			});
		}
	}
}