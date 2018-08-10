'use strict';

/**
 * A popover DOM management API
 * @param {Element} popover 
 */
function popoverAPI(popover) {


	return {
		render: appendPopover,
		hide: hidePopover,
		insertThumbnails: insertThumbnails,
		insertArticle: insertArticle,
		insertDictionary: insertDictionary,
		loading: insertBlankData,
		isPopoverChild: isPopoverChild,
		findElement: querySelector,
		findElements: querySelectorAll,
	};


	function insertThumbnails({ thumbList = [] }) {
		if (!thumbList.length) {
			popover = setListError();
		} else {
			var wikiSect = popover.querySelector('.js-wikiSect');
			var thumbWrapper = newElement('div', 'wikiSearches', ['js-wikiSearches']);
			var thumbnails = thumbnailsToHtml(thumbList);

			removeChildrenFrom(wikiSect);
			wikiSect.classList.add('list');
			thumbWrapper.appendChild(thumbnails);
			wikiSect.appendChild(thumbWrapper);
		}

		return popover;
	}

	function setListError() {
		var wikiSect = popover.querySelector('.js-wikiSect');
		var thumbWrapper = newElement('div', 'wikiSearches', ['js-wikiSearches']);

		removeChildrenFrom(wikiSect);
		wikiSect.classList.add('list');
		thumbWrapper.appendChild(document.createTextNode(`Didn't find any info 😕`));
		wikiSect.appendChild(thumbWrapper);

		return popover;
	}

	function insertArticle({ article, image }) {

		var wikiSect = popover.querySelector('.js-wikiSect');
		var blankArticle = wikiSect.querySelector('.js-wikiArticle');
		var content = wikipediaArticle(article, image);
		var imageElem = content.querySelector('.js-articleImage');


		wikiSect.removeChild(blankArticle);
		wikiSect.querySelector('.js-wikiSearches').classList.add('hidden');
		wikiSect.classList.remove('list');

		imageElem.onload = () => {
			let img = imageElem;
			let scale = 200 / img.naturalWidth;

			img.style.height = `${img.naturalHeight * scale}px`;
			img.style.width = `${img.naturalWidth * scale}px`;
			// img.setAttribute('style', `height: ${scale > 1? img.naturalHeight : img.naturalHeight * scale}px;`)
			// img.setAttribute('style', `width: ${scale > 1? img.naturalWidth : img.naturalWidth * scale}px;`)
			wikiSect.setAttribute('style', `height: ${img.height}px;`);
		};
		wikiSect.appendChild(content);

		return popover;
	}

	function insertBlankData({ area = '' }) {

		var wikiSect = popover.querySelector('.js-wikiSect');
		var thumbWrapper = newElement('div', 'wikiSearches', ['js-wikiSearches']);

		var areaToDisplay = {
			thumbnails: () => {

				wikiSect.classList.add('list');
				removeChildrenFrom(wikiSect);

				thumbWrapper.appendChild(blankThumbnails());
				wikiSect.appendChild(thumbheWrapper);
			},
			wiktionary: () => {

			},
			article: () => {
				let content = blankArticle();
				wikiSect.querySelector('.js-wikiSearches').classList.add('hidden');
				wikiSect.classList.remove('list');

				wikiSect.appendChild(content);
			}
		};
		try {
			areaToDisplay[area]();
		} catch (error) {

		}
		return popover;
	}

	function insertDictionary(data) {
		var dictSect = removeChildrenFrom(popover.querySelector('.js-wiktSect'));

		if (data) {
			var dictResult = wiktionaryArticle(data);
			dictSect.appendChild(dictResult);
			enableTab(2);
		} else {
			disableTab(2);
		}

	}

	/**
	 * Generates the dictionary section based on given data argument.
	 * @param {object} article The data returned from the wiktionary.
	 * @returns {DocumentFragment} The dictionary section to be inserted on the popover.
	 */
	function wiktionaryArticle(article) {

		var section = document.createDocumentFragment();

		Object.entries(article).forEach(entrie => { //foreach language
			try {
				var partsOfSpeech = entrie[1]
				var language = entrie[1][0].language;

				const span = document.createElement('span');
				const ul = document.createElement('ul');

				partsOfSpeech.forEach(group => {

					const liPoS = document.createRange().createContextualFragment(`
                    	<li id="\`li${uniqueId()}\`">
                    	    <span class="dict-partofspeach">${group.partOfSpeech}</span>
                    	    <ol type="1" id="dictDefs" class="dict-definition">
                    	    </ol>
                    	</li>`);


					group.definitions.forEach(def => {
						const wordDefinition = document.createElement('li');
						wordDefinition.innerText = def.definition.replace(/(<script(\s|\S)*?<\/script>)|(<style(\s|\S)*?<\/style>)|(<!--(\s|\S)*?-->)|(<\/?(\s|\S)*?>)/g, '');
						liPoS.querySelector('#dictDefs').appendChild(wordDefinition);
					});

					span.id = `s${uniqueId()}`;
					span.innerText = language;
					span.classList.add('dict-lang');
					ul.appendChild(liPoS);
					ul.classList.add('dict-lang--sections');
					section.appendChild(span);
					section.appendChild(ul);


				});
			} catch (error) {
				disableTab(2);
			}


		});

		return section;
	}

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
	}

	function removeChildrenFrom(element) {
		while (element.hasChildNodes()) {
			element.removeChild(element.lastChild);
		}

		return element;
	}

	function isPopoverChild(elemId) {
		try {
			return popover.querySelector(`#${elemId}`) === null ? false : true;
		} catch (error) {
			return false;
		}
	}

	function hidePopover() {
		popover.classList.remove('popover--enabled');
	}

	function uniqueId() {
		return (new Date()).getTime();
	}

	function querySelector(element) {
		return popover.querySelector(element);
	}

	function querySelectorAll(element) {
		return popover.querySelectorAll(element);
	}

	function disableTab(tabId) {
		var tabs = {
			1: '.js-wikiTab',
			2: '.js-wiktTab'
		}
		popover.querySelector(tabs[tabId]).setAttribute('disabled', 'disabled');;
	}

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

	function newElement(element = 'div', id = '', classList = []) {
		var el = document.createElement(element);
		el.id = id || el.id;
		if (classList.length) {
			el.classList.add(classList);
		}

		return el;
	}

	function parseWiktResponseToHtml(json) {}

	function parseJsonArticleToHtml(json) {}
}