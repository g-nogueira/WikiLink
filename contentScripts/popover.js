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
| Known issues:                                  |
| - The popover closes wherever you click,       |
| trigged by the onmousedown event; toDo.        |
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
        if (event.which === 1 && !selection.isCollapsed)
            searchSelectedAsync();
    });
    document.addEventListener('keypress', ev => key = ev.key)
    document.addEventListener('mousedown', ev => hideDiv());

    async function searchSelectedAsync() {
        const enabled = await isEnabledAsync();
        const selText = checkSelection(selection.toString());
        const range = checkSelection(selection.focusNode.data);

        if (selText != previous && enabled === true) {
            const txtData = await repoRequest(selText, range);
            const imgData = await imgRequest(selText);
            showData(txtData, imgData);
            previous = selText;
            autoResetSelection();
        }
    }

    async function isEnabledAsync() {
        return new Promise(resolve => {
            chrome.storage.sync.get('popover',
                obj => resolve(obj.popover.isEnabled)
            );
        });
    }

    function autoResetSelection() {
        setTimeout(function () {
            previous = null;
        }, 2000);
    }

    function checkSelection(text) {
        //If it is not empty neither is white spaces
        if (text && /\S/.test(text))
            return text;
        return previous;
    }

    function repoRequest(term, range) {
        const msg = {
            module: 'wikiRepo',
            method: 'searchTerm',
            key: term,
            range: range
        };
        return new Promise((resolve, reject) => chrome.runtime.sendMessage(msg, data => resolve(data)));
        imgRequest(term);

    }

    function imgRequest(term) {
        let msg = {
            module: 'wikiRepo',
            method: 'searchImage',
            key: term
        };
        return new Promise((resolve, reject) => chrome.runtime.sendMessage(msg, imgData => resolve(imgData)))
    }

    function showData(txtData, imgData) {
        const notFound = 'Ops: nenhum resultado encontrado...';
        const imageSection = popover.querySelector('#popover-image');
        const textSection = popover.querySelector('#popover-text');

        textSection.textContent = (txtData.body.length > 0 ? txtData.body : notFound);
        imageSection.src = imgData.url;
        showDiv();
    }

    function insertDiv() {
        const fragment = `
        <div class="popover" id="wikilink-popover">
            <div class="contentGroup">
                <img id="popover-image" class="popoverImage" src="">
                <p id="popover-text" class="popoverText"></p>
            </div>
        </div>`;
        popover = document.createRange().createContextualFragment(fragment).firstElementChild;
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

})();