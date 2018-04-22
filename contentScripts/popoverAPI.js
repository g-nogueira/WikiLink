'use strict';

/**
 * A popover DOM management API
 * @param {Element} popover 
 */
function popoverAPI(popover) {


    return {
        generateHTML: generateShell,
        dictionarySection: generateDictionary,
        displayIt: displayPopover,
        hideIt: hidePopover,
        displayError: displayError,
        insertData: insertData,
        popover: popover,
        isChild: isPopoverChild,
        querySelector: querySelector,
        querySelectorAll: querySelectorAll
    }

    var popover = popover;

    /**
     * 
     * @param {object} obj The parameters.
     * @param {string} obj.errorString The error string to show to the user.
     * @param {string} obj.tab The tab name to display the message.
     */
    function displayError(errorString, id = []) {
        id.forEach(el => {
            popover.querySelector(`${id}`).textContent = errorString;;
        });
    }

    /**
     * Generates the popover main structure without any data.
     * @returns {DocumentFragment} A popover documentFragment.
     */
    function generateShell() {
        //<div class="popover-arrow"></div>
        var styleString = `
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
                position:absolute;
                opacity: 0;
                display:block;
                background:#ffffff;
                width:auto;
                max-width: 500px;
                box-shadow:0 30px 90px -20px rgba(0,0,0,0.3), 0 0 1px #a2a9b1;
                text-align: left;
                z-index: -1;
                transform: translateY(100%);
                transition: transform .3s cubic-bezier(0.4, 0.0, 1, 1), opacity .3s cubic-bezier(0.4, 0.0, 1, 1);
                border-radius: 5px;
                font-size: 14px;
                font-family: 'Roboto', sans-serif !important;
                color: rgba(0,0,0,.87);
                font-weight: 400;
                line-height: 20px;
            }
            
            #popover.popover--enabled{
                opacity: 1;
                transform: translateY(0);
                z-index: 10;
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
                min-height: 100px;
                min-width: 500px;
                transition: height .3s cubic-bezier(0.4, 0.0, 1, 1);
            }
            
            .popoverImage{
                max-width: 200px;
                max-height: 200px;
                background-size: contain;
                border-radius: 0 0 5px 0;
            }
            
            .popoverText{
                font-family: sans-serif;
                font-size: 14px;
                line-height: 20px;
                color:#777;
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
            
            #navbar .tab::selection {
                background: rgba(0, 0, 0, 0) !important;
            }
            
            #navbar .tab:hover{
                background-color: rgba(0, 0, 0, .04);
            }
            
            .dict-lang--sections:last-child{
                margin-bottom: 10px !important;
            }
            
            .info-section{
                display: flex;
                flex-flow: row-reverse;
                padding-left: 10px;
                overflow-x: hidden;
                overflow-y: scroll;
                max-height: 230px;
                
            }
            
            .hidden{
                display: none !important;
            }
            
            .info-section .dict-lang {
                font-weight: bold;
                font-size: 120%;
                border-bottom: 1px solid rgba(0,0,0,.20);
                margin-bottom: 10px;
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
            
            .info-section:hover::-webkit-scrollbar,
            .info-section:hover::-webkit-scrollbar-thumb {
                visibility: visible !important;
            }
            
            .info-section::-webkit-scrollbar {
                visibility: hidden;
                width: .2em !important;
            }
            
            .info-section::-webkit-scrollbar-thumb {
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

            #wikiSect.list{
                display: flex;
                flex-direction: column;
            }
            
            #wikiSect.list #item{
                display: inline-flex;
                align-items: center;
                flex-shrink: 0;
                padding: 5px 8px 5px 0;
                border-bottom: 1px solid rgba(0,0,0, .2);
                cursor: pointer;
            }
            
            #wikiSect.list .title{
                font-weight: 500;
                font-size: 100%;
            }
            
            #wikiSect.list .description{
                font-size: 90%;
                line-height: initial;
                color: rgba(0, 0, 0, 0.54);
            }
            
            #wikiSect.list .image{
                width: 70px;
                height: 70px;
                display: flex;
                align-items: center;
                margin: 0 10px 0 0;
                overflow: hidden;
                flex-shrink: 0;
            }

            #wikiSect a{
                text-decoration: none;
                color: inherit;
            }
        </style>`;
        var popoverString = `
        <div id="popover" class="js-popover">
            <section id="navbar">
                <div class="tab js-tab" target=".js-wikiSect">Wikipedia</div>
                <div class="tab js-tab" target=".js-dictSect">Dictionary</div>
            </section>
            <main class="contentGroup">
                <section id="wikiSect" class="js-wikiSect js-infoSect info-section">
                    <img id="popoverImage" class="popoverImage" src="">
                    <p class="js-wikiInfo popoverText"></p>
                </section>
                <section id="dictionaryContent" class="js-dictSect js-infoSect info-section self-column hidden">
                </section>
            </main>
        </div>`;

        var popover = document.createRange().createContextualFragment(`${styleString} ${popoverString}`);



        popover.querySelectorAll('.js-tab').forEach(el => {
            el.addEventListener('click', ev => {
                const popover = ev.path.find(el => el.classList.contains('js-popover'));
                const infoSections = popover.querySelectorAll('.js-infoSect');

                infoSections.forEach(section => section.classList.add('hidden')); //Hides all pages/info-sections
                popover.querySelector(el.attributes.getNamedItem('target').value).classList.remove('hidden'); //Find the target info-section and shows it
            });
        });
        return popover;
    }

    function querySelector(element) {
        return popover.querySelector(element);
    }

    function querySelectorAll(element) {
        return popover.querySelectorAll(element);
    }

    /**
     * Displays the popover based on given selection, cal1 and cal2 coordinates.
     * @param {Selection} selection The current window selection on DOM.
     * @param {*} cal1 
     * @param {*} cal2 
     */
    function displayPopover(selection, cal1, cal2) {
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
                displayError('Ops... Term not found', ['.js-dictSect']);
            }


        });

        return section;
    }

    function generateWikiInfo(article, image) {
        var section = document.createDocumentFragment();

        let frag = `
                    <img id="popoverImage" class="popoverImage" ${image.url?'':'hidden'} src="${image.url}">
                    <p class="js-wikiInfo popoverText">${article.body}</p>
                `;

        section.appendChild(document.createRange().createContextualFragment(frag));

        return section;
    }

    function generateWikiList(wikiData) {

        var section = document.createDocumentFragment();

        wikiData.forEach(el => {
            try {
                let frag = `
                <div id="item" class="js-item">
                    <section class="image">
                        <img src="${el.img}" alt="">
                    </section>
                    <section class="info">
                        <div class="js-title title">${el.title}</div>
                        <div class="description">${el.body}</div>
                    </section>
                </div>`;

                section.appendChild(document.createRange().createContextualFragment(frag).firstElementChild);


            } catch (error) {
                displayError('Ops... Term not found', ['.js-wikiSect']);
            }


        });

        return section;
    }

    function hidePopover() {
        popover.classList.remove('popover--enabled');
    }

    /**
     * 
     * @param {object} article The term definition response returned from somewhere.
     * @param {string} article.body The text body of the article.
     * @param {object} image The image response returned from somewhere.
     * @param {string} image.url The url of the image.
     * @param {number} image.width The width of the image.
     * @param {number} image.height The height of the image.
     * @param {object} dictionary The definitions response returned from Wiktionary.
     */
    function insertData(article, image, dictionary, isList = false, list = []) {

        var errorMessage = 'Ops: nenhum resultado encontrado...';
        var wikiSect = popover.querySelector('.js-wikiSect');
        var dictSect = removeChildNodes(popover.querySelector('.js-dictSect'));
        var dictResult = generateDictionary(dictionary);

        if (isList) {
            list.forEach(el => {
                el.body = `${el.body.substr(0, 180)}...`;
            });
            let content = generateWikiList(list);
            removeChildNodes(wikiSect);
            wikiSect.classList.add('list');
            wikiSect.appendChild(content);

        } else {
            // wikiInfoSect.textContent = (article.body.length > 0 ? article.body : errorMessage);

            // if (image.url) {
            //     imgSection.src = image.url;
            // } else
            //     imgSection.hidden = true;
            let content = generateWikiInfo(article, image);
            wikiSect.classList.remove('list');
            removeChildNodes(wikiSect);
            wikiSect.appendChild(content);

        }

        dictSect.appendChild(dictResult);

        popover = popover;
        return popover;
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

    function uniqueId() {
        return (new Date()).getTime();
    }

}