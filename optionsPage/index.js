(function () {
    'use strict';
    /**
     * Shorthand function for querySelector
     * @param {string} el 
     * @returns {HTMLElement} 
     */
    const DOM = elem => document.body.querySelector(elem);
    var keyGroup = {
        codes: [],
        pressing: []
    };

    initializer().DOMEvents()
    initializer().elementsValues()
    initializer().storageEvents()



    ////////////////// IMPLEMENTATION //////////////////

    function initializer() {

        /**
         * Initializes DOM events listeners
         */
        function DOMEvents() {
            DOM('.js-popupShortcut').addEventListener('keydown', onKeyDown);
            DOM('.js-popupShortcut').addEventListener('keyup', onKeyUp);
            DOM('.js-popupShortcut').addEventListener('focus', onFocus);
            DOM('.js-popupShortcut').addEventListener('focusout', onFocusOut);
            DOM('.js-popupMode').addEventListener('change', savePopupMode);
            DOM('.js-fallbackLanguage').addEventListener('change', saveLanguage);
            DOM('.js-nlpLanguages').addEventListener('change', saveNlpLanguages);
        }

        /**
         * Initializes DOM Elements values
         */
        function elementsValues() {
            syncValues();
        }

        /**
         * Initializes storage changes listeners.
         */
        function storageEvents() {
            popoverDB.watchChanges().then(syncValues);
        }

        return {
            DOMEvents,
            elementsValues,
            storageEvents
        };

    }

    function onFocus(ev) {
        DOM('.js-popupShortcut').value = '';
    }

    function onFocusOut(ev) {
        saveShortcut();
    }

    function onKeyDown(ev) {
        console.log(keyGroup.pressing);
        if (keyGroup.pressing.length === 0) {
            keyGroup.codes = [];
        }
        if (keyGroup.codes.length < 3 && !keyGroup.codes.includes(ev.code)) {
            keyGroup.pressing.push(ev.keyCode);
            keyGroup.codes.push(ev.code);
            DOM('.js-popupShortcut').value = keyGroup.codes.toString();
        }
        
    }
    
    function onKeyUp(ev) {
        console.log(keyGroup.pressing);
        var index = keyGroup.codes.indexOf(ev.code);
        if (index !== -1) {
            keyGroup.pressing.splice(index, 1);
        }

    }
    
    async function syncValues(oldV, newV) {
        var fallbackLang = newV && newV['fallbackLang'] || await popoverDB.retrieve('fallbackLang');
        var popupMode = newV && newV['popupMode'] || await popoverDB.retrieve('popupMode');
        var nlpLangs = newV && newV['nlpLangs'] || await popoverDB.retrieve('nlpLangs');
        var shortcut = newV && newV['shortcut'] || await popoverDB.retrieve('shortcut');

        DOM('.js-fallbackLanguage').value = fallbackLang;
        DOM('.js-popupMode').value = popupMode;
        DOM('.js-popupShortcut').value = shortcut.toString();

        var checkboxList = document.body.querySelectorAll('.js-nlpLang');
        checkboxList.forEach(chkbx => {
            if (nlpLangs.includes(chkbx.value)) {
                chkbx.checked = true;
            }
        });
    }

    function saveLanguage() {
        var fallbackLanguage = DOM('.js-fallbackLanguage').value;
        popoverDB.update('fallbackLang', fallbackLanguage);
    }

    function savePopupMode() {
        var popupMode = DOM('.js-popupMode').value;
        popoverDB.update('popupMode', popupMode);
    }

    function saveShortcut() {
        var shortcut = keyGroup.codes;
        popoverDB.update('shortcut', shortcut);
    }

    function saveNlpLanguages() {
        var languages = [];
        var checkboxList = document.body.querySelectorAll('.js-nlpLang');

        checkboxList.forEach(chkbx => {
            if (chkbx.checked) {
                languages.push(chkbx.value);
            }
        });
        popoverDB.update('nlpLangs', languages);
    }
}());