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

    var previous = null;   //The previous selected text will keep stored for 2 seconds;
    var popover;           //The popover inserted;
    var selection = window.getSelection();

    insertCals();
    insertDiv();


    document.addEventListener('mouseup', ev => {
        if (event.which === 1 && !selection.isCollapsed && !isPopoverChild(ev.target.id))
            searchSelectedAsync();
    });
    document.addEventListener('keypress', ev => key = ev.key)
    document.addEventListener('click', ev => {
        if (!isPopoverChild(ev.target.id))
            hideDiv()
        resetSelection();

    });


    async function searchSelectedAsync() {
        const enabled = await isEnabledAsync();
        const selText = checkSelection(selection.toString());
        const range = checkSelection(selection.focusNode.data);

        if (selText != previous && enabled === true) {
            const txtData = await repoRequest(selText, range);
            const imgData = await imgRequest(txtData.title);
            const dictData = await wiktRequest(selText);
            showData(txtData, imgData, dictData);
            previous = selText;
        }
    }

    async function isEnabledAsync() {
        return new Promise(resolve => {
            chrome.storage.sync.get('popover',
                obj => resolve(obj.popover.isEnabled)
            );
        });
    }

    function resetSelection() {
        previous = null;
    }

    function checkSelection(text) {
        //If it is not empty neither is white spaces
        if (text && /\S/.test(text))
            return text;
        return previous;
    }

    function repoRequest(term, range) {
        const msg = {
            receiver: 'wikirepo',
            fnName: 'searchTerm',
            params: {
                term: term,
                range: range
            }
        };
        return new Promise((resolve, reject) => chrome.runtime.sendMessage(msg, data => resolve(data)));

    }

    function imgRequest(term) {
        let msg = {
            receiver: 'wikirepo',
            fnName: 'searchImage',
            params: { term: term }
        };
        return new Promise((resolve, reject) => chrome.runtime.sendMessage(msg, imgData => resolve(imgData)))
    }

    function wiktRequest(term, range) {
        const msg = {
            receiver: 'wiktrepo',
            fnName: 'searchTerm',
            params: {
                term: term
            }
        };
        return new Promise((resolve, reject) => chrome.runtime.sendMessage(msg, data => resolve(data)));

    }

    function showData(txtData, imgData, dictData) {
        const notFound = 'Ops: nenhum resultado encontrado...';
        const imageSection = popover.querySelector('#popover-image');
        const textSection = popover.querySelector('#popover-text');
        const dictTab = popover.querySelector('#dictionaryContent');

        textSection.textContent = (txtData.body.length > 0 ? txtData.body : notFound);
        if (!imgData || !imgData.url) //if undefined or empty url
            imageSection.hidden = true;

        else imageSection.src = imgData.url;

        const dictSection = createDictSection(dictData);
        removeChildNodes(dictTab);
        dictTab.appendChild(dictSection);

        showDiv();
    }

    function insertDiv() {
        const fragment =`
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
        popover = document.createRange().createContextualFragment(fragment).firstElementChild;

        popover.addEventListener('pointerleave', hideDiv);
        popover.querySelectorAll('.tab').forEach(el => {
            el.addEventListener('click', ev => {
                const pages = popover.querySelectorAll('.popover-tab-content');
                pages.forEach(elem => elem.classList.add('hidden'));
                popover.querySelector(el.attributes.getNamedItem('target').value).classList.remove('hidden');
            });
        });

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

    function showDiv() {
        /**From:
         * https://stackoverflow.com/questions/39283159/how-to-keep-selection-but-also-press-button
         */
        const selRange = selection.getRangeAt(0).getBoundingClientRect();
        const rb1 = DOMRect('#cal1'); //Creates
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

    function hideDiv() {
        popover.classList.remove('popover--enabled');
    }

    function isPopoverChild(id) {
        try {
            return document.querySelector(`#wikilink-popover #${id}`) === null ? false : true;
        } catch (error) {
            return false;
        }
    }

    function createDictSection(obj) {

        const section = document.createDocumentFragment();

        Object.keys(obj).forEach(el => { //foreach language
            const key = obj[el];

            const span = document.createElement('span');
            const ul = document.createElement('ul');
            
            
            span.innerText = key[0].language;
            key.forEach(pOS => { //foreach partOfSpeach
               let liFrag =  `
                <li>
                    <span class="dict-partofspeach">${pOS.partOfSpeech}</span>
                    <ol type="1" id="dictDefs" class="dict-definition">
                    </ol>
                </li>`;

                liFrag = document.createRange().createContextualFragment(liFrag).firstElementChild;

                pOS.definitions.forEach(def => {
                    const liDef = document.createElement('li');
                    liDef.innerText = def.definition.replace(/(<script(\s|\S)*?<\/script>)|(<style(\s|\S)*?<\/style>)|(<!--(\s|\S)*?-->)|(<\/?(\s|\S)*?>)/g,'');
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

})();