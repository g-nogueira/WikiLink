(function () {
    'use strict';
    /**
     * Shorthand function for querySelector
     * @param {string} el 
     * @returns {HTMLElement} 
     */
    const DOM = elem => document.body.querySelector(elem);

    initializer().DOMEvents()
    initializer().elementsValues()
    initializer().storageEvents()



    ////////////////// IMPLEMENTATION //////////////////

    function initializer() {

        /**
         * Initializes DOM events listeners
         */
        function DOMEvents() {
            DOM('.js-popupShortcut').addEventListener('keydown', insertKeyString);
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


    async function syncValues(oldV, newV) {
        var fallbackLang = newV && newV['fallbackLang'] || await popoverDB.retrieve('fallbackLang');
        var popupMode = newV && newV['popupMode'] || await popoverDB.retrieve('popupMode');
        var nlpLangs = newV && newV['nlpLangs'] || await popoverDB.retrieve('nlpLangs');

        DOM('.js-fallbackLanguage').value = fallbackLang;
        DOM('.js-popupMode').value = popupMode;

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
        var shortcut = DOM('.js-popupShortcut').value;
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

    function insertKeyString(ev) {
        ev.currentTarget.value += `${ev.code}`;
    }
}());