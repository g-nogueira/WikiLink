(() => {
    'use strict';

    /**
     * A popover DOM management API
     * The Popover element used in the manager dispatches some events:
     * - "tabselect" - When the user clicks on a tab (List, Wikipedia, or Wiktionary),
     * - "popoverHidden" - When the popover has finished the hidden process,
     * - "thumbclick" - When the user selects an article of the search response list,
     * - "pagechange" - When a change of page occurs, independent of the trigger,
     */
    module.exports = class iframeUtils {
        constructor() {

            let { iframe, cal1, cal2 } = this.init();

            this.iframe = iframe;
            this.cal1 = cal1;
            this.cal2 = cal2;
            this.render = this.show;
            this.isChild = this.isPopoverChild;

            this.addEventListener = (eventName, eventListener) => this.iframe.addEventListener(eventName, eventListener);

        }

        init() {
            let div = document.createElement('div');
            let shadow = div.attachShadow({ mode: 'open' });
            let iframe = document.createElement("iframe");
            let cal1 = createCal('cal1');
            let cal2 = createCal('cal2');

            div.classList.add('js-wikilink');
            div.style = `
                    background: transparent;
                    max-width: 600px;
                    height: 350px;
            `;

            iframe.style = `
                display: block;
                position: absolute;
                width: 100%;
                height: 100%;
                border: none;
                z-index: 2139999998;
            `;

            document.body.appendChild(cal1);
            document.body.appendChild(cal2);
            shadow.appendChild(iframe);
            document.body.appendChild(div);


            function createCal(id) {
                return document.createRange().createContextualFragment(`<div id="${id}">&nbsp;</div>`);
            }

            return { iframe: shadow.querySelector('iframe'), cal1: document.querySelector("#cal1"), cal2: document.querySelector("#cal2") };
        }

        getPosition(selection) {
            /**From:
             * https://stackoverflow.com/questions/39283159/how-to-keep-selection-but-also-press-button
             */
            var selRange = selection.getRangeAt(0).getBoundingClientRect();
            var position = { top: 0, left: 0 };
            var rb1 = DOMRect(this.cal1);
            var rb2 = DOMRect(this.cal2);

            position.top = `${(selRange.bottom - rb2.top) * 100 / (rb1.top - rb2.top)}px`;
            let leftPosition = calcLeftPos(selRange, rb1, rb2);

            if (leftPosition + this.iframe.clientWidth > window.innerWidth) {
                // popover.attributeStyleMap.set('left', CSS.px(leftPosition) - popover.clientWidth + selRange.width);
                position.left = `${calcLeftPos(selRange, rb1, rb2) - this.iframe.clientWidth + selRange.width}px`
            } else {
                // popover.attributeStyleMap.set('left', CSS.px((selRange.left - rb2.left) * 100 / (rb1.left - rb2.left)));
                position.left = `${(selRange.left - rb2.left) * 100 / (rb1.left - rb2.left)}px`;
            }

            this.iframe.classList.add('popover--enabled');

            function DOMRect(element) {
                const r = document.createRange()
                r.selectNode(element)
                return r.getBoundingClientRect();
            }

            function calcLeftPos(selRange, rb1, rb2) {
                return (selRange.left - rb2.left) * 100 / (rb1.left - rb2.left);
            }

            return position;
        }

        /**
         * Displays the popover based on given selection, cal1 and cal2 coordinates.
         * @param {Selection} selection The current window selection on DOM.
         * @param {*} cal1 
         * @param {*} cal2 
         */
        show(title, selection) {
            let pos = this.getPosition(selection);

            this.iframe.style.top = pos.top;
            this.iframe.style.left = pos.left;
            this.iframe.src = chrome.extension.getURL('pages/popoverGUI.html') + "?title=" + title;
        }

        isPopoverChild(elemIdentifier = '') {
            try {
                return iframe.querySelector(elemIdentifier) === null ? false : true;
            } catch (error) {
                return false;
            }
        }

        /**
         * @param {number} delay The delay in milliseconds to hide the popover.
         */
        hide(options, delay = 300) {
            setTimeout(() => {
                this.iframe.classList.remove('popover--enabled');
                const hideEvent = new CustomEvent('popoverHidden', {
                    bubbles: true,
                    detail: {
                        element: this.iframe,
                    }
                });

                this.iframe.dispatchEvent(hideEvent);
            }, delay);
        }

    }
})();