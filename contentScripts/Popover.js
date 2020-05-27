"use strict";

const Events = require("../utils/Events")
module.exports = class Popover extends Events {
    constructor() {
        super();

        this.events = {
            hidden: "popoverHidden",
            focusOut: "focusOut",
        };
        this.iframeUrl;
        this.iframeStyle;
        this.shadowMode;

        this._iframeWrapper = document.createElement("div");
        this._iframeWrapper.dataset.visible = 0;
        this._iframe = document.createElement("iframe");

        this._init();

    }

    _init() {
        document.body.addEventListener("click", (ev) => {
            if (this.isHidden) {
                return;
            }

            this.dispatchEvent(this.events.focusOut, {}, ev);
        });
    }

    /**
     * Inserts an iframe into the DOM using the options specified on `init()` method.
     *
     */
    insertIframe() {
        let parentElement = this._iframeWrapper;
        let shadow = parentElement.attachShadow({ mode: this.shadowMode });
        let iframeNode = this._iframe;

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

        this._iframe = iframeElement;
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
        this._iframe.parent.style.top = position.top + "px";
        this._iframe.parent.style.left = position.left + "px";

        this._iframe.style.width = options.width || this._iframe.style.width;
        this._iframe.style.height = options.height || this._iframe.style.height;

        this._iframe.src = this.iframeUrl + "?title=" + title;
        this._iframeWrapper.style.display = "block";
        this._iframeWrapper.dataset.visible = 1;
    }

    /**
     * Hides the iframe
     *
     * @param {*} options
     * @param {Number} [delay=300] A delay in milliseconds to hide the iframe.
     */
    hide(options, delay = 300) {
        setTimeout(() => {
            this._iframeWrapper.style.display = "none";
            this._iframeWrapper.dataset.visible = 0;
            this.dispatchEvent(this.events.hidden, {});
        }, delay);
    }

    get isHidden() {
        return this._iframeWrapper.dataset.visible == false;
    }

};