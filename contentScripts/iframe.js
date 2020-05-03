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
    module.exports = class popoverUtils {
        constructor() {
            this.iframe = this.init();
            this.render = this.show;
            this.isChild = this.isPopoverChild;

            this.addEventListener = (eventName, eventListener) => this.iframe.addEventListener(eventName, eventListener);

        }

        init() {
            let parentElement = document.createElement('div');
            let shadow = parentElement.attachShadow({ mode: 'open' });
            let iframeNode = document.createElement("iframe");

            parentElement.classList.add('js-wikilink');
            parentElement.style = `
                position: absolute;
                background: transparent;
            `;

            iframeNode.style = `
                width: 600px;
                height: 350px;
                border: none;
                z-index: 2139999998;
            `;

            shadow.appendChild(iframeNode);
            document.body.appendChild(parentElement);

            let iframeElement = shadow.querySelector('iframe');
            iframeElement.parent = parentElement;

            return iframeElement;
        }

        /**
         *
         *
         * @param {Selection} selection
         * @returns
         */
        getOffsetSelectionPosition(selection) {

            var temporaryNode = this.createUniqueNode();
            var temporaryNodeTop = 0;
            var range = selection.getRangeAt(0);
            var clientRect = range.getBoundingClientRect();
            var position = { top: 0, left: 0 };

            // Insert a node at the start of the selection and get its position relative to the top of the body
            range.insertNode(temporaryNode);
            temporaryNodeTop = temporaryNode.offsetTop;

            // Determine the position below the selection as scrolledHeight (i.e.: temporaryNodeTop) + selectionHeight
            position.top = temporaryNodeTop + clientRect.height + "px";
            position.left = clientRect.left + "px";

            // Remove the previously inserted node
            temporaryNode.parentElement.removeChild(temporaryNode);

            this.iframe.classList.add('popover--enabled');

            return position;
        }

        /**
         * Displays the popover based on given selection, cal1 and cal2 coordinates.
         * @param {Selection} selection The current window selection on DOM.
         */
        show(title, selection, options) {
            let pos = this.getOffsetSelectionPosition(selection);

            this.iframe.parent.style.top = pos.top;
            this.iframe.parent.style.left = pos.left;

            this.iframe.width = options.width || "500px";
            this.iframe.height = options.height || "276px";

            this.iframe.src = chrome.extension.getURL('pages/popoverGUI.html') + "?title=" + title;
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

        createUniqueNode() {
            var node = document.createElement("span");

            node.id = this.uniqueId;
            node.style.position = "absolute";

            return node;
        }

        get uniqueId() {
            return (new Date()).getTime();
        }

    }
})();