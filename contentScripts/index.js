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
|It depends on: popoverAPI.js                    |
|                                                |
@------------------------------------------------@
*/

(async function () {
    "use strict";

    var HTML = popoverAPI().generateHTML();
    var popover = appendOnBody(HTML);
    var wikilink = document.body.querySelector('.js-wikilink');
    var ppvAPI = popoverAPI(popover);
    var cals = insertCals();
    var messageHand = messageHandler();
    var isPopoverEnabled = await popoverDB.retrieve('isEnabled');
    var shortcut = await popoverDB.retrieve('shortcut');
    var popupMode = await popoverDB.retrieve('popupMode');
    var keyGroup = [];

    initDOMEvents();





    ////////////////// IMPLEMENTATION //////////////////

    function initDOMEvents() {
        popoverDB.watchChanges().then((oldV, newV) => {
            shortcut = newV.shortcut;
            popupMode = newV.popupMode;
            isPopoverEnabled = newV.isEnabled;
        });

        if (popupMode === 'shortcut') {
            document.addEventListener('keydown', onKeyDown)
            document.addEventListener('keyup', onKeyUp)
        }
        if (popupMode === 'default') {
            document.addEventListener('mouseup', onMouseUp);
        }
        wikilink.addEventListener('mouseenter', onMouseEnter);
        wikilink.addEventListener('mouseleave', onMouseLeave);
    }

    function onKeyDown(ev) {
        if (keyGroup.toString() === shortcut.toString()) {
            startPopup();
            keyGroup = [];
        }
        if (keyGroup.length < shortcut.length && !keyGroup.includes(ev.code)) {
            keyGroup.push(ev.code);
            onKeyDown(ev);            
        }
    }

    function onKeyUp(ev) {
        var index = keyGroup.indexOf(ev.code);
        if (index !== -1) {
            keyGroup.splice(index, 1);
        }
    }

    function onMouseUp(ev) {
        if (ev.which === 1 && !ppvAPI.isChild(ev.target.id)) {
            startPopup();
        }
    }

    async function startPopup() {
        var selection = window.getSelection();

        if (isPopoverEnabled && !selection.isCollapsed && !isEmptySelection(selection.toString())) {
            searchSelection(selection).then(resp => {

                let data = {
                    article: resp.article,
                    image: resp.image,
                    // dictionary: resp.definition,
                    isList: true,
                    list: resp.list
                };

                ppvAPI.insertDictionary(resp.definition);
                ppvAPI.insertData(data);
                ppvAPI.querySelectorAll('.js-item').forEach(item => {
                    item.addEventListener('click', showArticle);
                });
            });

            ppvAPI.insertBlankData({
                isList: true
            });
            ppvAPI.displayIt(selection, cals[0], cals[1]);
        }
    }

    function onMouseEnter(ev) {
        document.body.style.overflow = 'hidden';
    }

    function onMouseLeave(ev) {
        document.body.style.overflow = 'auto';
        setTimeout(() => ppvAPI.hideIt(), 300);

    }

    function showArticle(ev) {
        let data = {};
        let lang = ev.currentTarget.attributes.getNamedItem('lang').value;
        let id = ev.currentTarget.id;
        var termHandler = messageHand.request();

        ppvAPI.insertBlankData({
            isList: false
        });

        termHandler.getArticle({
            pageId: id,
            imageSize: 250,
            lang: lang
        }).then(async resp => {

            data.article = resp.body;
            data.image = resp.image;
            data.isList = false;
            ppvAPI.insertData(data);

            let dictionary = await termHandler.wiktionary(resp.title);
            ppvAPI.insertDictionary(dictionary);
        });

    }

    async function searchSelection(selectionObj) {

        var selection = selectionObj.toString();
        var selContext = selectionObj.focusNode.data;
        var selectionHandler = messageHand.request(selection);
        var results = {};

        return new Promise(async (resolve, reject) => {

            results.list = await selectionHandler.getArticles(selContext);
            results.definition = await selectionHandler.wiktionary();

            resolve(results);
        });
    }

    function appendOnBody(popover) {
        const div = document.createElement('div');
        const shadow = div.attachShadow({
            mode: 'open'
        });

        div.classList.add('js-wikilink');
        shadow.appendChild(popover);
        document.body.appendChild(div);

        return shadow.querySelector('.js-popover');
    }

    function insertCals() {
        var cal1, cal2;
        cal1 = createCal('cal1');
        cal2 = createCal('cal2');
        document.body.appendChild(cal1);
        document.body.appendChild(cal2);


        function createCal(id) {
            var calString = `<div id="${id}">&nbsp;</div>`;
            const cal = document.createRange().createContextualFragment(calString);
            return cal;
        }

        return [document.querySelector('#cal1'), document.querySelector('#cal2')];
    }

    function isEmptySelection(selection) {
        //If given argument is not empty neither is white spaces
        if (selection && /\S/.test(selection))
            return false;
        return true;
    }

}());