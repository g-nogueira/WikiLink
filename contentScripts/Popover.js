"use strict";

const Events = require("../utils/Events")
module.exports = class Popover extends Events {
    constructor() {
        super();

        this.events = {
            popoverHidden: "popoverHidden"
        };
        this.iframeUrl;
        this.iframe;
        this.iframeWidth;
        this.iframeHeight;
        this.iframeStyle;
        this.shadowMode;
    }

    /**
     * Initializes DOM preferences
     *
     * @param {Object} options
     * @param {String} options.iframeUrl
     * @param {Number} options.iframeWidth
     * @param {Number} options.iframeHeight
     * @param {String} options.iframeStyle
     * @param {"open"|"closed"} options.shadowMode A string specifying the encapsulation mode for the shadow DOM tree
     * @returns
     */
    init(options) {
        this.iframeUrl = options.iframeUrl;
        this.iframeWidth = options.iframeWidth || 501;
        this.iframeHeight = options.iframeHeight || 276;
        this.shadowMode = options.shadowMode || "open";
        this.iframeStyle = options.iframeStyle || `
            width: ${this.iframeWidth}px;
            height: ${this.iframeHeight}px;
            border: none;
            z-index: 2139999998;
            box-shadow: 0 30px 90px -20px rgba(0, 0, 0, 0.3), 0 0 1px #a2a9b1;
        `;

        return this;
    }

    /**
     * Inserts an iframe into the DOM using the options specified on `init()` method.
     *
     */
    insertIframe() {
        let parentElement = document.createElement("div");
        let shadow = parentElement.attachShadow({ mode: this.shadowMode });
        let iframeNode = document.createElement("iframe");

        parentElement.classList.add("js-wikilink");
        parentElement.style = `
            position: absolute;
            background: transparent;
        `;

        iframeNode.style = this.iframeStyle;


        shadow.appendChild(iframeNode);
        document.body.appendChild(parentElement);

        let iframeElement = shadow.querySelector("iframe");
        iframeElement.parent = parentElement;

        this.iframe = iframeElement;
        this._dispatcher = iframeElement;
    }

    /**
     * Displays the iframe on the specified x,y coordinates.
     * 
     * @param {String} title
     * @param {Object} position
     * @param {Number} position.top
     * @param {Number} position.left
     * @param {Object} [options={}]
     * @param {Number} options.width
     * @param {Number} options.height
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
     * Hides the iframe
     *
     * @param {*} options
     * @param {Number} [delay=300] A delay in milliseconds to hide the iframe.
     */
    hide(options, delay = 300) {
        setTimeout(() => {
            this.iframe.classList.remove("popover--enabled");
            this.dispatchEvent(this.events.popoverHidden, { element: this.iframe });
        }, delay);
    }

};