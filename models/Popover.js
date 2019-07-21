(() => {

    module.exports = class Popover {

        HTMLElement;

        constructor(wikipediaAPI, wiktionaryAPI) {

            this.HTMLElement = this._createHTMLStructure();
            this.close = this._hideAll;
            this.open = this._displayHTMLElement;
            this._wikiAPI = wikipediaAPI;
            this._wiktAPI = wiktionaryAPI;

            this._appendOnBody();
            this._addEventListeners();
            this.cals = this._insertCals();
        }

        _addEventListeners() {
            this.HTMLElement.addEventListener('tabselect', ev => this._showPage(ev.detail.target, !this._isElementDisabled(ev.detail.element)));
            this.HTMLElement.addEventListener('popoverHidden', ev => this._disableTab(1));
            this.HTMLElement.addEventListener('thumbclick', ev => this._enableTab(1));
            this.HTMLElement.addEventListener('pagechange', ev => {
                if (ev.detail.element === this._HTMLElements.articleView || ev.detail.element === this._HTMLElements.wiktView) {
                    this._showElements(this._HTMLElements.tabs.listView);
                } else {
                    this._hideElements(this._HTMLElements.tabs.listView);
                }
            });
        }

        /**
         * 
         * @param {object} param0 The options to display the popover.
         */
        _displayHTMLElement({ searchFor = '' , selectionContext = '', selection}) {
            // Displays the HTML Element
            // If searchFor is empty, display empty search
            // Else search for the term.

            _displayAll(selection, this.cals[1], this.cals[2])

            if (searchFor) {
                
            } else {
                
            }
        }

        _showPage(pageClass, condition = true) {
            return () => {
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
            };

        }

        _isElementChild(elemIdentifier = '') {
            var response = false;
            try {
                response = this.HTMLElement.querySelector(elemIdentifier) === null ? false : true;
            } catch (error) {
                response = false;
            }

            return response;
        }

        _insertCals() {
            var cal1, cal2;
            cal1 = createCal('cal1');
            cal2 = createCal('cal2');
            document.body.appendChild(cal1);
            document.body.appendChild(cal2);


            function createCal(id) {
                return document.createRange().createContextualFragment(`<div id="${id}">&nbsp;</div>`);
            }

            return [document.querySelector('#cal1'), document.querySelector('#cal2')];
        }

        get _HTMLElements() {
            return {
                listView: this.HTMLElement.querySelector('.js-wikiSearches'), // listWrapper
                articleView: this.HTMLElement.querySelector('.js-wikiSect'), // wikipediaWrapper
                wiktView: this.HTMLElement.querySelector('.js-wiktSect'), // wiktionaryWrapper
                tabs: {
                    listView: this.HTMLElement.querySelector('.js-listTab'), // resultsTab
                    articleView: this.HTMLElement.querySelector('.js-wikiTab'), // wikiTab
                    wiktView: this.HTMLElement.querySelector('.js-wiktTab'), // wiktTab
                },
            }
        }

        /**
		 * @param {number} delay The delay in milliseconds to hide the popover.
		 */
        _hideAll(delay = 300) {
            setTimeout(() => {
                this.HTMLElement.classList.remove('popover--enabled');
                const hideEvent = new CustomEvent('popoverHidden', {
                    bubbles: true,
                    detail: {
                        element: this.HTMLElement,
                    }
                });

                this.HTMLElement.dispatchEvent(hideEvent);
            }, delay);
        }

        /**
		 * Displays the popover based on given selection, cal1 and cal2 coordinates.
		 * @param {Selection} selection The current window selection on DOM.
		 * @param {*} cal1 
		 * @param {*} cal2 
		 */
        _displayAll(selection, cal1, cal2) {

			/**From:
			 * https://stackoverflow.com/questions/39283159/how-to-keep-selection-but-also-press-button
			 */
            var selRange = selection.getRangeAt(0).getBoundingClientRect();
            var rb1 = DOMRect(cal1);
            var rb2 = DOMRect(cal2);

            this.HTMLElement.style.top = `${(selRange.bottom - rb2.top) * 100 / (rb1.top - rb2.top)}px`;
            let leftPosition = calcLeftPos(selRange, rb1, rb2);

            if (leftPosition + popover.clientWidth > window.innerWidth) {
                this.HTMLElement.style.left = `${calcLeftPos(selRange, rb1, rb2) - this.HTMLElement.clientWidth + selRange.width}px`
            } else {
                this.HTMLElement.style.left = `${(selRange.left - rb2.left) * 100 / (rb1.left - rb2.left)}px`;
            }

            this.HTMLElement.classList.add('popover--enabled');

            function DOMRect(element) {
                const r = document.createRange()
                r.selectNode(element)
                return r.getBoundingClientRect();
            }

            function calcLeftPos(selRange, rb1, rb2) {
                return (selRange.left - rb2.left) * 100 / (rb1.left - rb2.left);
            }

            this.HTMLElement
                .querySelectorAll('.js-tab')
                .forEach(tab => tab.addEventListener('click', ev => {
                    const tabSelect = new CustomEvent('tabselect', {
                        bubbles: true,
                        detail: {
                            target: ev.currentTarget.attributes.getNamedItem('target').value,
                            element: ev.target
                        }
                    });

                    this.HTMLElement.dispatchEvent(tabSelect);
                }));
        }

        _hideElements(identifier = '') {

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

        _showElements(identifier = '') {
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

        /**
         * Disables a tab by given id.
         * @param {number} tabId  The id of the tab to be disabled (1: Wikipedia | 2: Wiktionary).
         */
        _disableTab(tabId) {
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
        _enableTab(tabId) {
            var tabs = {
                1: '.js-wikiTab',
                2: '.js-wiktTab'
            }
            if (popover.querySelector(tabs[tabId]).hasAttribute('disabled')) {
                popover.querySelector(tabs[tabId]).removeAttribute('disabled');
            }
        }

        _isElementDisabled(element) {
            return element.hasAttribute('disabled');
        }

        _showPage(pageClass, condition = true) {
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

        _createHTMLStructure() {
            var elementString = this._popoverContent;
            var styleString = this._popoverStyles;
            var popover = new DocumentFragment();

            popover = document.createRange().createContextualFragment(`${styleString} ${elementString}`);
            popover = this._insertThumbnails(popover, blankThumbnails());

            popover.querySelectorAll('.js-infoSect').forEach(section => section.classList.add('hidden'));
            popover.querySelector('.js-wikiSearches').classList.remove('hidden');

            return popover;
        }

        _appendOnBody() {
            const div = document.createElement('div');
            const shadow = div.attachShadow({ mode: 'open' });

            div.classList.add('js-wikilink');
            shadow.appendChild(this._HTMLElements);
            document.body.appendChild(div);

            return shadow.querySelector('.js-popover');
        }

        get _shadowRootParent() {
            return document.body.querySelector('.js-wikilink');
        }

        _insertThumbnails(popover, thumbnails) {

            popover.querySelector('.js-wikiSearches').appendChild(thumbnails);

            return popover;
        }

        /**
         * Generates blank thumbnails to use as placeholders while the content is being loaded.
         * @param {number} quantity The quantity of thumbnails.
         */
        blankThumbnails(quantity = 6) {

            var frag = document.createDocumentFragment();

            for (let i = 0; i < quantity; i++) {
                let fragString = `
                    <div class="js-item item item--blank">
                        <section class="image--blank"></section>
                        <section class="info">
                            <div class="js-title title--blank"></div>
                            <div class="description--blank"></div>
                            <div class="description--blank"></div>
                        </section>
                    </div>`;

                frag.appendChild(document.createRange().createContextualFragment(fragString).firstElementChild);
            }

            return frag;
        }


        /**
         * Generates the popover inner HTML.
         */
        get _popoverContent() {
            // <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
            return `
                <div id="popover" class="js-popover">
                    <section id="navbar">
                        <div class="tab btn--navigator js-tab js-listTab js-wikiNavigator" target=".js-wikiSearches"><i class="material-icons">👈</i></div>
                        <!--<div class="tab btn--navigator js-tab js-listTab js-wikiNavigator" target=".js-wikiSearches"><i class="material-icons">list</i></div>-->
                        <div class="tab js-tab js-wikiTab" target=".js-wikiSect" disabled="disabled">Wikipedia</div>
                        <div class="tab js-tab js-wiktTab" target=".js-wiktSect">Dictionary</div>
                    </section>
                    <main class="contentGroup js-contentGroup">
                        <section id="wikiSearches" class="js-wikiSearches js-infoSect info-section"></section>
                        <section id="wikiSect" class="js-wikiSect js-infoSect info-section"></section>
                        <section id="dictionaryContent" class="js-wiktSect js-infoSect info-section self-column hidden"></section>
                    </main>
                </div>`;
        }

        /**
         * Generates the popover CSS.
         */
        get _popoverStyles() {
            return `
            <style>
                :root{
                    --primary-text-color: rgba(0, 0, 0, 0.87);
                    --secundary-text-color: rgba(0, 0, 0, 0.54);
                    --disabled-text-color: rgba(0, 0, 0, 0.38);
                }
                #popover{
                    all: initial;
                }
                #popover {
                    will-change: opacity;
                    position:fixed;
                    opacity: 0;
                    background:#ffffff;
                    width:auto;
                    max-width: 500px;
                    box-shadow:0 30px 90px -20px rgba(0,0,0,0.3), 0 0 1px #a2a9b1;
                    text-align: left;
                    z-index: -10;
                    transform: translateY(10%);
                    transition: transform 0.2s cubic-bezier(0.4, 0.0, 1, 1), opacity .2s, z-index .5s;
                    border-radius: 5px;
                    font-size: 14px;
                    font-family: 'Roboto', sans-serif !important;
                    color: rgba(0,0,0,.87);
                    font-weight: 400;
                    line-height: 20px;
                }
                
                #popover.popover--enabled{
                    display:block;
                    opacity: 1;
                    transform: translateY(0);
                    z-index: 100;
                    position: absolute;
                }
                
                #cal1{
                    position:absolute;
                    height:0px;
                    width:0px;
                    top:100px;
                    left:100px;
                    overflow:none;
                    z-index:-100;
                }
                #cal2{
                    position:absolute;
                    height:0px;
                    width:0px;
                    top:0px;
                    left:0px;
                    overflow:none;
                    z-index:-100;
                }
                
                .contentGroup{
                    // min-height: 200px;
                    min-width: 500px;
                    transition: height .3s cubic-bezier(0.4, 0.0, 1, 1);
                }

                #wikiSect #wikiArticle{
                    display: flex;
                    flex-flow: row-reverse;
                }

                #wikiSect .wikiArticle--blank{
                    width: 100%;
                }

                #wikiSect .wikiArticle--blank .text--blank{
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                }
                
                .popoverImage,
                .popoverImage--blank{
                    max-width: 200px;
                    max-height: 200px;
                    background-size: contain;
                    border-radius: 0 0 5px 0;
                }

                .popoverImage--blank{
                    width: 200px;
                    height: 200px;
                    background-color: #fafafa;
                }
                
                .popoverText{
                    font-family: sans-serif;
                    font-size: 14px;
                    line-height: 20px;
                    color:#777;
                    overflow-x: hidden;
                    overflow-y: scroll;
                    margin: 0;
                }
                
                #navbar{
                    display: inline-flex;
                    width: -webkit-fill-available;
                    align-items: center;
                }
                
                #navbar .tab {
                    padding-top: 13px;
                    padding-bottom: 13px;
                    flex-grow: 1;
                    text-align: center;
                    cursor: pointer;
                    transition: background-color .3s;
                }
                
                #navbar .tab.btn--navigator {
                //     position: absolute;
                //     left: 5%;
                    flex-grow: 0.25;
                }

                #navbar .tab::selection {
                    background: rgba(0, 0, 0, 0) !important;
                }
                
                #navbar .tab:hover{
                    background-color: rgba(0, 0, 0, .04);
                }

                #navbar .tab[disabled]{
                    color: rgba(0,0,0,.50);
                    cursor: unset;
                }

                #navbar .tab[disabled]:hover{
                    background-color: #fff;
                }
                
                #dictionaryContent{
                    overflow-x: hidden;
                    overflow-y: scroll;
                }
                .dict-lang--sections:last-child{
                    margin-bottom: 10px !important;
                }
                
                .info-section{
                    display: flex;
                    flex-flow: row-reverse;
                    padding-left: 10px;
                    overflow: hidden;
                    max-height: 230px;
                }

                .info{
                    width: 100%;
                    height: auto;
                    align-self: flex-start;
                }
                
                #wikiSect{
                    margin-right: -1.3px;
                }

                
                
                .hidden{
                    display: none !important;
                }
                
                .info-section .dict-lang {
                    font-weight: bold;
                    font-size: 120%;
                    border-bottom: 1px solid rgba(0,0,0,.20);
                    margin-bottom: 10px;
                    // overflow-y: scroll;
                }
                
                .info-section .dict-lang:not(:first-child) {
                    margin-top: 10px;
                }
                
                .info-section .dict-partofspeach {
                    font-size: 105%;
                    font-weight: 500;
                }
                
                .info-section .dict-lang--sections {
                    list-style: none;
                    padding: initial;
                    margin: initial;
                }
                
                .popoverText:hover::-webkit-scrollbar,
                #wikiSearches:hover::-webkit-scrollbar,
                #dictionaryContent.info-section:hover::-webkit-scrollbar,
                .popoverText:hover::-webkit-scrollbar-thumb,
                #wikiSearches:hover::-webkit-scrollbar-thumb,
                #dictionaryContent.info-section:hover::-webkit-scrollbar-thumb {
                    visibility: visible !important;
                }
                
                .popoverText::-webkit-scrollbar,
                #wikiSearches::-webkit-scrollbar,
                #dictionaryContent.info-section::-webkit-scrollbar {
                    visibility: hidden;
                    width: .2em !important;
                }
                
                .popoverText::-webkit-scrollbar-thumb,
                #wikiSearches::-webkit-scrollbar-thumb,
                #dictionaryContent.info-section::-webkit-scrollbar-thumb {
                    visibility: hidden;
                    background-color: darkgrey !important;
                    outline: 1px solid slategrey !important;
                }
                
                .self-column{
                    display: flex;
                    flex-flow: column;
                }
                
                ol{
                    -webkit-padding-start: 40px !important;
                    margin: 0 !important;
                }
                
                ol li{
                    list-style-type: decimal !important;
                }
                
                .popover-arrow{
                    width: 0;
                    height: 0;
                    border-left: 10px solid transparent;
                    border-right: 10px solid transparent;
                    border-bottom: 10px solid white;
                    z-index: 100000;
                    top: -10px;
                    position: relative;
                    right: -10px;
                }

                #wikiSect {
                    min-height: 200px;
                }
                #wikiSearches{
                    overflow-x: hidden;
                    overflow-y: scroll;
                    display: flex;
                    flex-direction: column;
                    min-height: 230px;
                }
                
                #wikiSearches .item{
                    display: inline-flex;
                    align-items: center;
                    flex-shrink: 0;
                    padding: 5px 8px 5px 0;
                    border-bottom: 1px solid rgba(0,0,0, .2);
                    cursor: pointer;
                }
                
                #wikiSearches .item .title{
                    font-weight: 500;
                    font-size: 100%;
                }

                #wikiSearches .item .title--blank{
                    width: 50%;
                    height: 15px;
                    margin-bottom: 10px;
                    background-color: #fafafa;
                }
                
                
                #wikiSearches .item .description{
                    font-size: 90%;
                    line-height: initial;
                    color: rgba(0, 0, 0, 0.54);
                }
                
                #wikiSearches .item .description--blank{
                    width: 80%;
                    height: 10px;
                    margin-top: 2.5px;
                    background-color: #fafafa;
                }
                
                #wikiSect .description--blank{
                    width: 95%;
                    height: 13px;
                    margin-top: 8px;
                    background-color: #fafafa;
                }
                #wikiSect .description--blank:nth-child(3n+0),
                #wikiSearches .item .description--blank:last-child,
                #wikiSect .description--blank:last-child{
                    width: 70%;
                }

                #wikiSearches .item .image,
                #wikiSearches .item .image--blank{
                    width: 70px;
                    height: 70px;
                    display: flex;
                    align-items: center;
                    margin: 0 10px 0 0;
                    overflow: hidden;
                    flex-shrink: 0;
                }

                #wikiSearches .item .image--blank{
                    background-color: #fafafa;
                }

                #wikiSect a{
                    text-decoration: none;
                    color: inherit;
                }
            </style>`;

        }

    }
})();