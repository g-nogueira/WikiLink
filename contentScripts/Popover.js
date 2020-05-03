"use strict";

/**
 * A popover DOM management API
 * The Popover element used in the manager dispatches some events:
 * - "shortcutMatch" - When the user clicks on a tab (List, Wikipedia, or Wiktionary),
 */
module.exports = class Popover {
    constructor() {
        this.iframeUrl = "";
        this.iframe = {};
        this.shadowMode = "open";

        this.addEventListener = (eventName, eventListener) => this.iframe.addEventListener(eventName, eventListener);
    }

    init(options) {
        this.iframeUrl = options.iframeUrl;
        this.iframeWidth = options.iframeWidth || 501;
        this.iframeHeight = options.iframeHeight || 276;
        this.shadowMode = options.shadowMode;

        return this;
    }

    insertIframe() {
        let parentElement = document.createElement("div");
        let shadow = parentElement.attachShadow({ mode: this.shadowMode });
        let iframeNode = document.createElement("iframe");

        parentElement.classList.add("js-wikilink");
        parentElement.style = `
                position: absolute;
                background: transparent;
            `;

        iframeNode.style = `
                width: ${this.iframeWidth}px;
                height: ${this.iframeHeight}px;
                border: none;
                z-index: 2139999998;
                box-shadow: 0 30px 90px -20px rgba(0, 0, 0, 0.3), 0 0 1px #a2a9b1;
            `;

        shadow.appendChild(iframeNode);
        document.body.appendChild(parentElement);

        let iframeElement = shadow.querySelector("iframe");
        iframeElement.parent = parentElement;

        this.iframe = iframeElement;
    }

    /**
     * Displays the popover based on given selection, cal1 and cal2 coordinates.
     * @param {Selection} selection The current window selection on DOM.
     */
    show(title, position, options = {}) {
        this.iframe.parent.style.top = position.top + "px";
        this.iframe.parent.style.left = position.left + "px";

        this.iframe.style.width = options.width || this.iframe.style.width;
        this.iframe.style.height = options.height || this.iframe.style.height;

        this.iframe.src = this.iframeUrl + "?title=" + title;

        this.iframe.classList.add("popover--enabled");
    }

    /**
     * @param {number} delay The delay in milliseconds to hide the popover.
     */
    hide(options, delay = 300) {
        setTimeout(() => {
            this.iframe.classList.remove("popover--enabled");
            const hideEvent = new CustomEvent("popoverHidden", {
                bubbles: true,
                detail: {
                    element: this.iframe,
                }
            });

            this.iframe.dispatchEvent(hideEvent);
        }, delay);
    }

};