'use strict';

/**
 * A popover DOM management API
 * @param {Element} popover 
 */
function popoverAPI(popover) {


	return {
		displayIt: insertPopover,
		hideIt: hidePopover,
		insertArticleList: insertArticlesList,
		insertArticle: insertArticle,
		insertDictionary: insertDictionary,
		isWaiting: insertBlankData,
		isPopoverChild: isPopoverChild,
		findElement: querySelector,
		findElements: querySelectorAll,
	};


	/**
	 * 
	 * @param {string} article The article string.
	 * @param {object} image The image response returned from somewhere.
	 * @param {string} image.source The url of the image.
	 * @param {number} image.width The width of the image.
	 * @param {number} image.height The height of the image.
	 * @param {object} dictionary The definitions response returned from Wiktionary.
	 */
	function insertArticlesList({ list = [] }) {
		if (list.length === 0) {
			popover = setListError();
		} else {
			var wikiSect = popover.querySelector('.js-wikiSect');
			var wikiList = document.createElement('div');
			wikiList.id = 'wikiSearches';
			wikiList.classList.add('js-wikiSearches');

			let content = generateWikiList(list);

			removeChildNodes(wikiSect);
			wikiSect.classList.add('list');
			wikiList.appendChild(content);
			wikiSect.appendChild(wikiList);

		}
		return popover;
	}

	function setListError() {
		var wikiSect = popover.querySelector('.js-wikiSect');
		var wikiList = document.createElement('div');
		wikiList.id = 'wikiSearches';
		wikiList.classList.add('js-wikiSearches');

		removeChildNodes(wikiSect);
		wikiSect.classList.add('list');
		wikiList.appendChild(document.createTextNode('Didn\'t find any info 😕'));
		wikiSect.appendChild(wikiList);

		return popover;
	}

	function insertArticle({ article, image }) {

		var wikiSect = popover.querySelector('.js-wikiSect');
		var wikiList = document.createElement('div');
		wikiList.id = 'wikiSearches';
		wikiList.classList.add('js-wikiSearches');

		let content = generateWikiInfo(article, image);

		let blankArticle = wikiSect.querySelector('.js-wikiArticle');
		wikiSect.removeChild(blankArticle);
		wikiSect.querySelector('.js-wikiSearches').style.display = 'none';
		wikiSect.classList.remove('list');
		wikiSect.setAttribute('style', image.height >= 200 ? '' : `height: ${image.height}px;`);

		wikiSect.appendChild(content);

		return popover;
	}

	function insertBlankData({ area = '' }) {

		var wikiSect = popover.querySelector('.js-wikiSect');
		var wikiList = document.createElement('div');
		wikiList.id = 'wikiSearches';
		wikiList.classList.add('js-wikiSearches');

		try {
			var areaToDisplay = {
				articles: () => {
					let content = generateBlankWikiList();
					removeChildNodes(wikiSect);

					wikiSect.classList.add('list');
					wikiSect.appendChild(wikiList);
					wikiList.appendChild(content);
				},
				wiktionary: () => {

				},
				article: () => {
					let content = generateBlankWikiInfo();

					// removeChildNodes(wikiSect);
					wikiSect.querySelector('.js-wikiSearches').style.display = 'none';
					wikiSect.classList.remove('list');

					wikiSect.appendChild(content);
				}
			};

			areaToDisplay[area]();
		} catch (error) {

		}
		return popover;
	}

	function insertDictionary(data) {
		var dictSect = removeChildNodes(popover.querySelector('.js-wiktSect'));

		if (data) {
			var dictResult = generateDictionary(data);
			dictSect.appendChild(dictResult);
			enableTab(2);
		} else {
			disableTab(2);
		}

	}

	/**
	 * Generates the dictionary section based on given data argument.
	 * @param {object} dictData The data returned from the wiktionary.
	 * @returns {DocumentFragment} The dictionary section to be inserted on the popover.
	 */
	function generateDictionary(dictData) {

		var section = document.createDocumentFragment();

		Object.keys(dictData).forEach(el => { //foreach language
			try {
				const key = dictData[el];
				const span = document.createElement('span');

				let ul = document.createElement('ul');
				key.forEach(pOS => { //foreach partOfSpeach
					let liFrag = `
                    <li id="\`li${uniqueId()}\`">
                        <span class="dict-partofspeach">${pOS.partOfSpeech}</span>
                        <ol type="1" id="dictDefs" class="dict-definition">
                        </ol>
                    </li>`;

					liFrag = document.createRange().createContextualFragment(liFrag).firstElementChild;

					pOS.definitions.forEach(def => {
						const liDef = document.createElement('li');
						liDef.innerText = def.definition.replace(/(<script(\s|\S)*?<\/script>)|(<style(\s|\S)*?<\/style>)|(<!--(\s|\S)*?-->)|(<\/?(\s|\S)*?>)/g, '');
						liFrag.querySelector('#dictDefs').appendChild(liDef);
					});

					span.id = `s${uniqueId()}`;
					span.innerText = key[0].language;
					span.classList.add('dict-lang');
					ul.appendChild(liFrag);
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

	function generateWikiInfo(article, image) {
		var section = document.createDocumentFragment();

		let frag = `
                <div id="wikiArticle" class="js-wikiArticle">
                    <img id="popoverImage" class="popoverImage" src="${image.source || 'https://raw.githubusercontent.com/g-nogueira/WikiLink/master/public/images/404/01image404--200.png'}">
                    <p class="js-wikiInfo popoverText">${article}</p>
                </div>
                `;

		section.appendChild(document.createRange().createContextualFragment(frag));

		return section;
	}

	function generateBlankWikiInfo() {
		var section = document.createDocumentFragment();

		let frag = `
                <div id="wikiArticle" class="js-wikiArticle wikiArticle--blank">
                    <div id="popoverImage" class="popoverImage--blank"></div>
                    <section class="text--blank">
                        <div class="description--blank"></div>
                        <div class="description--blank"></div>
                        <div class="description--blank"></div>
                        <div class="description--blank"></div>
                        <div class="description--blank"></div>
                        <div class="description--blank"></div>
                        <div class="description--blank"></div>
                        <div class="description--blank"></div>
                    </section>
                </>
                `;

		section.appendChild(document.createRange().createContextualFragment(frag));

		return section;
	}

	function generateWikiList(wikiData) {

		var section = document.createDocumentFragment();
		wikiData.forEach(el => {
			try {
				let frag = `
                <div id="${el.pageId}" lang="${el.lang}" class="js-item item">
                    <section class="image">
                        <img src="${el.img || "https://raw.githubusercontent.com/g-nogueira/WikiLink/master/public/images/404/01image404--70.png"}" alt="">
                    </section>
                    <section class="info">
                        <div class="js-title title">${el.title}</div>
                        <div class="description">${el.body}</div>
                    </section>
                </div>`;

				section.appendChild(document.createRange().createContextualFragment(frag).firstElementChild);


			} catch (error) {
				// alert('Wikilinks error on line 590 - PopoverAPI.js');
			}


		});

		return section;
	}

	function generateBlankWikiList() {

		var section = document.createDocumentFragment();

		for (let i = 0; i < 6; i++) {
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
	function insertPopover(selection, cal1, cal2) {
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

	function removeChildNodes(element) {
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

	function getShortcut() {

	}
}