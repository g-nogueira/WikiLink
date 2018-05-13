(function () {
    'use strict';

    const DOM = elem => document.body.querySelector(elem);


    DOM('.js-form').addEventListener('change', saveForm);
    DOM('.js-popupShortcut').addEventListener('keydown', insertKeyString);




    function saveForm(ev) {
        // saveLanguage();
        // savePopupMode();

    }

    function saveLanguage() {
        var fallbackLanguage = DOM.querySelector('.js-fallbackLanguage').value;
        manager.update('fallbackLanguage').value(fallbackLanguage);
    }

    function savePopupMode() {
        var popupMode = DOM.querySelector('.js-popupMode').value;
        manager.update('popupMode').value(popupMode);
    }

    function saveShortcut() {
        var shortcut = DOM.querySelector('.js-popupShortcut').value;
        manager.update('shortcut').value(shortcut);
    }

    function saveNlpLanguages() {
        var languages = DOM.querySelector('.js-popupShortcut').value;
        manager.update('nlpLanguages').value(shortcut);
    }

    function insertKeyString(ev) {
        ev.currentTarget.value += `${ev.code}`;
    }
}());