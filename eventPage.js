(function () {
    "use strict";

    initializeDB();

    /**
     * 1: fallBackLanguage: 1: 'en' || 2: 'es' || 3: 'pt' || 4: 'ru'
     * 2: popupMode: 1:'default' || 2: 'shortcut'
     * 3: shortcutToShowPopover: 'keyId + keyId'
     * 4: listOfLanguagesToProcess: [1?, 2?, 3?, 4?]
     * 5: isPopoverEnabled : true || false
     */
    function initializeDB() {
        let wikilinkData = JSON.stringify({
            1: 'en',
            2: 'shortcut',
            3: ["ShiftLeft","AltLeft"],
            4: ["por","eng","esp","rus"],
            5: true
        });

        popoverDB.retrieve()
            .then(obj => {
                if (typeof obj !== 'object') {
                    chrome.storage.sync.set({wldt: wikilinkData}, () => {});
                }
            })
            .catch(error => chrome.storage.sync.set({wldt: wikilinkData}, () => {}));
    }

    // chrome.contextMenus.create({
    //     title: 'Search \"%s\" on Wikipedia',
    //     contexts: ["selection"],
    //     onclick: function (info) {
    //         const url = `http://www.wikipedia.org/w/index.php?title=Special:Search&search=${info.selectionText}`;
    //         chrome.tabs.create({
    //             url: url
    //         });
    //     }
    // });

}());