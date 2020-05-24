"use strict";

module.exports = class Events {

    /**
     * Creates an instance of Events.
     * @param {Object} [options={}]
     * @param {HTMLElement} [options.dispatcher]
     * @param {Object} options.events
     * 
     */
    constructor(options = {}) {
        this._dispatcher = options.dispatcher || document.createElement("div");
        this.events = options.events;


        this.shortcut = [];
    }

    /**
     * Dispatches a synthetic event to target and returns true if either event's cancelable attribute value is false or its preventDefault() method was not invoked, and false otherwise.
     *
     * @param {String} type
     * @param {Any} details Any custom data to be dispatch with the event.
     * @param {Event} ev The parent event, if any.
     * @param {Boolean} canBubble A boolean indicating whether the event goes through its target's ancestors in reverse tree order.
     * @param {Boolean} cancelable A boolean indicating whether the event can be canceled by invoking the preventDefault() method.
     */
    dispatchEvent(type, details, ev = null, canBubble = true, cancelable = true) {

        var _details = details;

        if (ev !== null) {
            _details.ev = ev;
        }

        const event = new CustomEvent(type, {
            bubbles: canBubble,
            cancelable: cancelable,
            detail: _details,
        })


        return this._dispatcher.dispatchEvent(event);
    }

    /**
     * Appends an event listener for events whose type attribute value is `type`. The callback argument sets the callback that will be invoked when the event is dispatched.
     *
     * @param {String} type
     * @param {(this: HTMLElement, ev: HTMLElementEventMap[K]) => any} eventListener
     * @return
     */
    addEventListener(type, eventListener) {
        this._dispatcher.addEventListener(type, eventListener);
    }

    get _shortcutMatchEvent() {
        return new CustomEvent("shortcutMatch", {
            bubbles: true,
            detail: {}
        });
    }

};