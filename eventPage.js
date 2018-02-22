﻿(function () {
    "use strict";

    initializeDB();

    function initializeDB() {
        manager.retrieve('popover').then(obj => {
            if (typeof obj !== 'object')
            manager.update({ key: 'popover', value: {isEnabled: true, shortcuts: []}});
        });
    }

    chrome.contextMenus.create({
        title: 'Search \"%s\" on Wikipedia',
        contexts: ["selection"],
        onclick: function (info) {
            const url = `http://www.wikipedia.org/w/index.php?title=Special:Search&search=${info.selectionText}`;
            chrome.tabs.create({ url: url });
        }

    });

})();