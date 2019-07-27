(() => {
    var btnScroll = document.querySelector('#btnScroll');
    var wikilinkDemo = document.querySelector('#wikilinkDemo');

    btnScroll.addEventListener("click", () => {
        wikilinkDemo.scrollIntoView({
            behavior: 'smooth'
        });
        new Typed("#secondQuestion", {
            startDelay: 500,
            typeSpeed: 30,
            strings: ["<strong>Wikilink</strong> is simple!\n You just have to"]
            // strings: ["<strong>Wikilink</strong> is simple!\n You just have to select a word."]
        });
    });
    
    // new Typed("#firstQuestion", {
    //     startDelay: 500,
    //     smartBackspace: false,
    //     strings: ["How does it work?"],
    //     typeSpeed: 30,
    //     onComplete: () => {
    //         document.querySelector("#btnScroll").hidden = false;
    //     }
    // });
    

})();