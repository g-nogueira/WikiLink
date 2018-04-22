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
    wikilink.addEventListener('mouseenter', onMouseIn);
    wikilink.addEventListener('mouseleave', onMouseOut);



    ////////////////// IMPLEMENTATION //////////////////

    async function onMouseUp(ev) {
        var selection = window.getSelection();

        if (event.which === 1 && !selection.isCollapsed && !ppvAPI.isChild(ev.target.id) && !isEmptySelection(selection.toString())) {

            let resp = await searchSelection(selection);
            ppvAPI.insertData(resp.article, resp.image, resp.definition, true, resp.list);
            ppvAPI.querySelectorAll('.js-item').forEach(item => {
                item.addEventListener('click', async (click) => {

                    let data = {};
                    let term = click.currentTarget.querySelector('.js-title').textContent;

                    data.article = await messageHand.request(term).wikipedia();
                    data.image = await messageHand.request(term).image(250);
                    data.definition = await messageHand.request(term).wiktionary();
                    
                    ppvAPI.insertData(data.article, data.image, data.definition, false);
                });
            });
            ppvAPI.displayIt(selection, cals[0], cals[1]);
        }
    }

    function onMouseIn(ev) {
            document.body.style.overflow = 'hidden';
    }

    function onMouseOut(ev) {
            document.body.style.overflow = 'auto';
            ppvAPI.hideIt()
    }

    async function searchSelection(selection) {

        var popoverPrefs = await manager.retrieve('popover');

        if (popoverPrefs.isEnabled) {
            return new Promise(async (resolve, reject) => {
            
                let selText = selection.toString();
                let range = selection.focusNode.data;
                let data = {};

                // data.article = await messageHandler.request(selText).wikipedia(range);
                // data.image = await messageHandler.request(data.article.title).image(250);
                data.list = await messageHand.request(selText).wikiList(range);

                var promises = [];
                data.list.forEach(el => promises.push(messageHand.request(el.title).image(70)));
                let resp = await Promise.all(promises);

                data.list.forEach((el, i) => {
                    try {
                        data.list[i].img = resp[i].url;
                    } catch (error) {
                        data.list[i].img = '';
                    }
                });
                data.definition = await messageHand.request(selText).wiktionary();

                resolve(data);

            });
        }
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

        return [document.querySelector('#cal1'), document.querySelector('#cal2')];
    }

    function request(term) {

        return {
            wikipedia: repoRequest,
            wikiList: listRequest,
            image: imgRequest,
            wiktionary: wiktRequest
        }


        async function repoRequest(range) {
            var params = {}
            params.term = term;
            params.range = range;
            params.language = await manager.retrieve('language');

            return sendMessage('wikirepo', 'searchTerm', params);
        }

        async function listRequest(range) {
            var params = {}
            params.term = term;
            params.range = range;
            params.language = await manager.retrieve('language');

            return sendMessage('wikirepo', 'searchTermList', params);
        }

        function imgRequest(size) {
            var params = {};
            params.term = term;
            params.size = size;

            return sendMessage('wikirepo', 'searchImage', params);
        }

        function wiktRequest(range) {
            var params = {};
            params.term = term;

            return sendMessage('wiktrepo', 'searchTerm', params);
        }

    }

    function isEmptySelection(selection) {
        //If given argument is not empty neither is white spaces
        if (selection && /\S/.test(selection))
            return false;
        return true;
    }

}());