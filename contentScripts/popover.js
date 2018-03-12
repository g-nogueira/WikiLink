/*
#### DOM manipulation, data input and output ####
@------------------------------------------------@
| It creates a div element at the displayed page |
| DOM, as well as two "cals", for padding sakes. |
| Gets the ranges of these elements and listen to|
| the onmouseup event, that gets the selected    |
| text, parses it and request data to the API.   |
| The response will be displayed into a popover. |
|                                                |
|It depends on: css/popover.css                  |
|                                                |
@------------------------------------------------@
*/

(function () {
    "use strict";

    var popover; //The popover inserted on the DOM;

    insertCals();
    createPopover();

    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('click', onClick);



    ////////////////// IMPLEMENTATION //////////////////

    async function onMouseUp(ev) {
        var selection = window.getSelection();

        if (event.which === 1 && !selection.isCollapsed && !isPopoverChild(ev.target.id) && !isEmptySelection(selection.toString())) {
            const resp = await searchSelection(selection);
            showData(resp.article, resp.image, resp.definition);
        }

        function isEmptySelection(selection) {
            //If given argument is not empty neither is white spaces
            if (selection && /\S/.test(selection))
                return false;
            return true;
        }
    }

    function onClick(ev) {
        if (!isPopoverChild(ev.path[0].id)) {
            hidePopover()
        }
    }

    async function searchSelection(selection) {
        var popover = await manager.retrieve('popover');

        if (popover.isEnabled) {
            let selText = selection.toString();
            let range = selection.focusNode.data;
            let data = {};

            data.article = await repoRequest(selText, range);
            data.image = await imgRequest(data.article.title);
            data.definition = await wiktRequest(selText);

            return data;
        }
        else return null;
    }

    function showData(txtData, imgData, dictData) {
        const notFound = 'Ops: nenhum resultado encontrado...';
        const imageSection = popover.querySelector('#popover-image');
        const textSection = popover.querySelector('#popover-text');
        const dictTab = popover.querySelector('#dictionaryContent');

        textSection.textContent = (txtData.body.length > 0 ? txtData.body : notFound);
        //if doesn't have an url
        if (!imgData.url) {
            imageSection.hidden = true;
        }
        else imageSection.src = imgData.url;

        const dictSection = createDictSection(dictData);
        removeChildNodes(dictTab);
        dictTab.appendChild(dictSection);

        showPopover();
    }

    function createPopover() {
        const div = document.createElement('div');
        const shadow = div.attachShadow({ mode: 'open' });

        shadow.appendChild(wikilinkHTML());

        popover = shadow.querySelector('#wikilink-popover');

        // document.body.appendChild(div); //not using shadow root
        document.body.appendChild(popover);
    }

    function insertCals() {
        let cal1, cal2;
        cal1 = createCal('cal1');
        cal2 = createCal('cal2');
        document.body.appendChild(cal1);
        document.body.appendChild(cal2);


        function createCal(id) {
            const calString = `<div id="${id}">&nbsp;</div>`;
            const cal = document.createRange().createContextualFragment(calString);
            return cal;
        }
    }

    function showPopover() {
        /**From:
         * https://stackoverflow.com/questions/39283159/how-to-keep-selection-but-also-press-button
         */
        var selection = window.getSelection();
        const selRange = selection.getRangeAt(0).getBoundingClientRect();
        const rb1 = DOMRect('#cal1');
        const rb2 = DOMRect('#cal2');
        popover.style.top = `${(selRange.bottom - rb2.top) * 100 / (rb1.top - rb2.top)}px`;
        popover.style.left = `${(selRange.left - rb2.left) * 100 / (rb1.left - rb2.left)}px`;
        // popover.style.display = 'block';
        popover.classList.add('popover--enabled');

        function DOMRect(element) {
            const r = document.createRange()
            r.selectNode(document.querySelector(element))
            return r.getBoundingClientRect();
        }
    }

    function hidePopover() {
        popover.classList.remove('popover--enabled');
    }

    function isPopoverChild(id) {
        try {
            return popover.querySelector(`#${id}`) === null ? false : true;
        } catch (error) {
            return false;
        }
    }

    function createDictSection(obj) {

        var section = document.createDocumentFragment();

        Object.keys(obj).forEach(el => { //foreach language
            const key = obj[el];

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

    function removeChildNodes(element) {
        while (element.hasChildNodes()) {
            element.removeChild(element.lastChild);
        }
    }

    /**
     * @returns {Element}
     */
    function wikilinkHTML() {
        //<div class="popover-arrow"></div>
        const fragment = `
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
                z-index: 10;
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
        <div class="popover" id="wikilink-popover">
            <section class="popover-navbar">
                <div id="wikiTab" class="tab" target="#wikipediaContent">Wikipedia</div>
                <div id="dictTab" class="tab" target="#dictionaryContent">Dictionary</div>
            </section>
            <main class="contentGroup">
                <section class="popover-tab-content" id="wikipediaContent">
                    <img id="popover-image" class="popoverImage" src="">
                    <p id="popover-text" class="popoverText"></p>
                </section>
                <section class="popover-tab-content self-column hidden" id="dictionaryContent">
                    
                </section>
            </main>
        </div>`;
        popover = document.createRange().createContextualFragment(fragment);

        // popover.addEventListener('pointerleave', hideDiv);
        popover.querySelectorAll('.tab').forEach(el => {
            el.addEventListener('click', ev => {
                const pages = popover.querySelectorAll('.popover-tab-content');
                pages.forEach(elem => elem.classList.add('hidden'));
                popover.querySelector(el.attributes.getNamedItem('target').value).classList.remove('hidden');
            });
        });

        return popover;
    }

    async function repoRequest(term, range) {
        var params = {}
        params.term = term;
        params.range = range;
        params.language = await manager.retrieve('language');

        return sendMessage('wikirepo', 'searchTerm', params);
    }

    function imgRequest(term) {
        var params = {};
        params.term = term;

        return sendMessage('wikirepo', 'searchImage', params);
    }

    function wiktRequest(term, range) {
        var params = {};
        params.term = term;

        return sendMessage('wiktrepo', 'searchTerm', params);
    }

})();