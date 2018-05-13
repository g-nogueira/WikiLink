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

(function () {
    "use strict";

    var HTML = popoverAPI().generateHTML();
    var popover = appendOnBody(HTML);
    var wikilink = document.body.querySelector('.js-wikilink');
    var ppvAPI = popoverAPI(popover);
    var cals = insertCals();
    var messageHand = messageHandler();


    document.addEventListener('mouseup', onMouseUp);
    wikilink.addEventListener('mouseenter', onMouseEnter);
    wikilink.addEventListener('mouseleave', onMouseLeave);



    ////////////////// IMPLEMENTATION //////////////////

    async function onMouseUp(ev) {

        var selection = window.getSelection();
        var popoverPrefs = await manager.retrieve('popover');

        if (popoverPrefs.isEnabled && (ev.which === 1 && !selection.isCollapsed && !ppvAPI.isChild(ev.target.id) && !isEmptySelection(selection.toString()))) {

            searchSelection(selection).then(resp => {

                let data = {
                    article: resp.article,
                    image: resp.image,
                    // dictionary: resp.definition,
                    isList : true,
                    list : resp.list
                };

                ppvAPI.insertDictionary(resp.definition);
                ppvAPI.insertData(data);
                ppvAPI.querySelectorAll('.js-item').forEach(item => {
                    item.addEventListener('click', showArticle);
                });
            });

            ppvAPI.insertBlankData({isList: true});
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

        ppvAPI.insertBlankData({isList: false});

        termHandler.getArticle({pageId: id, imageSize: 250, lang: lang}).then(async resp => {
            
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