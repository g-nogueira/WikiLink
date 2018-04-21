﻿/*
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
    var ppvAPI = popoverAPI(popover);
    var cals = insertCals();

    document.addEventListener('mouseup', onMouseUp);
    popover.addEventListener('mouseout', onMouseOut);



    ////////////////// IMPLEMENTATION //////////////////

    async function onMouseUp(ev) {
        var selection = window.getSelection();

        if (event.which === 1 && !selection.isCollapsed && !ppvAPI.isChild(ev.target.id) && !isEmptySelection(selection.toString())) {

            let resp = await searchSelection(selection);
            ppvAPI.insertData(resp.article, resp.image, resp.definition, resp.list, true);
            ppvAPI.displayIt(selection, cals[0], cals[1]);
        }
    }

    function onMouseOut(ev) {
        if (ev.path[ev.path.length - 2].id !== 'wikilink-popover') {
            //The path will stop at shadow-root; shadow-root - 1 is the popover
            ppvAPI.hideIt()
        }
    }

    async function searchSelection(selection) {

        var popover = await manager.retrieve('popover');

        if (popover.isEnabled) {
            return new Promise(async (resolve, reject) => {
                let selText = selection.toString();
                let range = selection.focusNode.data;
                let data = {};

                // data.article = await request(selText).wikipedia(range);
                // data.image = await request(data.article.title).image();
                data.list = await request(selText).wikiList(range);

                var promises = [];
                data.list.forEach(el => promises.push(request(el.title).image()));
                let resp = await Promise.all(promises);

                data.list.forEach((el, i) => {
                    try {
                        data.list[i].img = resp[i].url;
                    } catch (error) {
                        data.list[i].img = '';
                    }
                });
                data.definition = await request(selText).wiktionary();

                resolve(data);

            });
        } else return null;
    }

    function appendOnBody(popover) {
        const div = document.createElement('div');
        const shadow = div.attachShadow({
            mode: 'open'
        });

        div.id = 'wikilink';
        shadow.appendChild(popover);
        document.body.appendChild(div);

        return shadow.querySelector('#wikilink-popover');
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

        function imgRequest() {
            var params = {};
            params.term = term;

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