'use strict';

function popoverAPI(popover) {


    return {
        generateHTML: generateHTML,
        dictionarySection: createDictSection,
        displayIt: displayPopover,
        hideIt: hidePopover,
        displayError: displayError,
        insertData: insertData,
        popover: popover,
        isChild: isPopoverChild
    }

    var popover = popover;

    /**
     * 
     * @param {object} obj The parameters.
     * @param {string} obj.errorString The error string to show to the user.
     * @param {string} obj.tab The tab name to display the message.
     */
    function displayError(errorString, tab) {
        var wikiContent = popover.querySelector('#wikipediaContent');
        var wiktContent = popover.querySelector('#dictionaryContent');

        wikiContent.querySelector('#wikiText').textContent = errorString;
        wiktContent.querySelector('#wikiText').textContent = errorString;
    }

    /**
     * @returns {Element}
     */
    function generateHTML() {
        //<div class="popover-arrow"></div>
        var styleString = `
        <style>
            :root{
            --primary-text-color: rgba(0, 0, 0, 0.87);
            --secundary-text-color: rgba(0, 0, 0, 0.54);
            --disabled-text-color: rgba(0, 0, 0, 0.38);
            }
            .popover {
            position:absolute;
            opacity: 0;
            display:block;
            background:#ffffff;
            width:auto;
            max-width: 500px;
            box-shadow:0 30px 90px -20px rgba(0,0,0,0.3), 0 0 1px #a2a9b1;
            text-align: left;
            z-index: -10;
            transform: translateY(100%);
            transition: transform .3s cubic-bezier(0.4, 0.0, 1, 1), opacity .3s cubic-bezier(0.4, 0.0, 1, 1);
            border-radius: 5px;
            font-size: 14px;
            font-family: 'Roboto', sans-serif !important;
            color: var(--primary-text-color);
            font-weight: 400;
            line-height: 20px;
            }

            .popover.popover--enabled{
                opacity: 1;
                z-index: 10;
                transform: translateY(0);
        
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
            color:#777;
            }

            .popover-navbar{
            display: inline-flex;
            width: -webkit-fill-available;
            align-items: center;
            }

            .popover-navbar .tab {
            padding-top: 13px;
            padding-bottom: 13px;
            flex-grow: 1;
            text-align: center;
            cursor: pointer;
            transition: background-color .3s;
            }

            section.popover-navbar .tab::selection {
            background: rgba(0, 0, 0, 0);
            }

            .popover-navbar .tab:hover{
            background-color: rgba(0, 0, 0, .04);
            }

            .dict-lang--sections:last-child{
            margin-bottom: 10px !important;
            }

            .popover-tab-content{
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

            .popover-tab-content .dict-lang {
            font-weight: bold;
            font-size: 120%;
            border-bottom: 1px solid rgba(0,0,0,.20);
            margin-bottom: 10px;
            }

            .popover-tab-content .dict-lang:not(:first-child) {
            margin-top: 10px;
            }

            .popover-tab-content .dict-partofspeach {
            font-size: 105%;
            font-weight: 500;
            }

            .popover-tab-content .dict-lang--sections {
            list-style: none;
            padding: initial;
            margin: initial;
            }

            .popover-tab-content:hover::-webkit-scrollbar,
            .popover-tab-content:hover::-webkit-scrollbar-thumb {
            visibility: visible;
            }

            .popover-tab-content::-webkit-scrollbar {
            visibility: hidden;
            width: .2em;
            }

            .popover-tab-content::-webkit-scrollbar-thumb {
            visibility: hidden;
            background-color: darkgrey;
            outline: 1px solid slategrey;
            }

            .self-column{
            display: flex;
            flex-flow: column;
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
        </style>
        `;
        var popoverString = `
        <div class="popover" id="wikilink-popover">
            <section id="popoverNavbar" class="popover-navbar">
                <div id="wikiTab" class="tab" target="#wikipediaContent">Wikipedia</div>
                <div id="dictTab" class="tab" target="#dictionaryContent">Dictionary</div>
            </section>
            <main id="popoverMain" class="contentGroup">
                <section id="wikipediaContent" class="popover-tab-content">
                    <img id="popoverImage" class="popoverImage" src="">
                    <p id="wikiText" class="popoverText"></p>
                </section>
                <section id="dictionaryContent" class="popover-tab-content self-column hidden">
                </section>
            </main>
        </div>`;

        var popover = document.createRange().createContextualFragment(`${styleString} ${popoverString}`);



        popover.querySelectorAll('.tab').forEach(el => {
            el.addEventListener('click', ev => {
                const pv = ev.path.find(el => el.id === 'wikilink-popover');
                const pages = pv.querySelectorAll('.popover-tab-content');
                pages.forEach(elem => elem.classList.add('hidden'));
                pv.querySelector(el.attributes.getNamedItem('target').value).classList.remove('hidden');
            });
        });

        return popover;
    }

    /**
     * @param {object} obj The parameters
     */
    function displayPopover(selection, cal1, cal2) {
        /**From:
         * https://stackoverflow.com/questions/39283159/how-to-keep-selection-but-also-press-button
         */
        var selRange = selection.getRangeAt(0).getBoundingClientRect();
        var rb1 = DOMRect(cal1);
        var rb2 = DOMRect(cal2);

        popover.style.top = `${(selRange.bottom - rb2.top) * 100 / (rb1.top - rb2.top)}px`;
        popover.style.left = `${(selRange.left - rb2.left) * 100 / (rb1.left - rb2.left)}px`;
        // popover.style.display = 'block';
        popover.classList.add('popover--enabled');

        function DOMRect(element) {
            const r = document.createRange()
            r.selectNode(element)
            return r.getBoundingClientRect();
        }
    }

    function createDictSection(dictData) {

        var section = document.createDocumentFragment();

        Object.keys(dictData).forEach(el => { //foreach language
            const key = dictData[el];

            const span = document.createElement('span');
            const ul = document.createElement('ul');


            span.innerText = key[0].language;
            key.forEach(pOS => { //foreach partOfSpeach
                let liFrag = `
                <li>
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

                ul.appendChild(liFrag);
            });

            ul.classList.add('dict-lang--sections');
            span.classList.add('dict-lang');

            section.appendChild(span);
            section.appendChild(ul);
        });

        return section;
    }

    function hidePopover() {
        popover.classList.remove('popover--enabled');
    }

    function insertData(article, image, dictionary) {
        var errorMessage = 'Ops: nenhum resultado encontrado...';
        var imgSection = popover.querySelector('#popoverImage');
        var wikiText = popover.querySelector('#wikiText');
        var dictTab = removeChildNodes(popover.querySelector('#dictionaryContent'));
        var dictSection = createDictSection(dictionary);

        wikiText.textContent = (article.body.length > 0 ? article.body : errorMessage);

        if (image.url) {
            imgSection.src = image.url;
        }
        else
            imgSection.hidden = true;

        dictTab.appendChild(dictSection);

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
}