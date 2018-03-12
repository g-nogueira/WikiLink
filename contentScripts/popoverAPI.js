'use strict';

class PopoverFrontEnd {
    constructor() {
        this.html = this.gerenateHTML();
        this.header = {
            wikiTab: this.html.querySelector('#wikiTab'),
            wiktTab: this.html.querySelector('#dictTab'),
        };
        this.main = {
            wikiContent: this.html.querySelector('#wikipediaContent'),
            wiktContent: this.html.querySelector('#dictionaryContent')
        };

        this.displayData()
    }

    /**
     * 
     * @param {string} errorString The error string to show to the user.
     * @param {string} tab The tab name to display the message.
     */
    error(errorString, tab) {
        this.main.wikiContent.querySelector('#wikiText').textContent = errorString;
        this.main.wiktContent.querySelector('#wikiText').textContent = errorString;
    }

    /**
     * @returns {Element}
     */
    gerenateHTML() {
        //<div class="popover-arrow"></div>
        const styleString = `
        <style>
            :root{
            --primary-text-color: rgba(0, 0, 0, 0.87);
            --secundary-text-color: rgba(0, 0, 0, 0.54);
            --disabled-text-color: rgba(0, 0, 0, 0.38);
            }
            .popover {
            position:absolute;
            opacity: 0;
            display:block;
            background:#ffffff;
            width:auto;
            max-width: 500px;
            box-shadow:0 30px 90px -20px rgba(0,0,0,0.3), 0 0 1px #a2a9b1;
            text-align: left;
            z-index: 10;
            transform: translateY(100%);
            transition: transform .3s cubic-bezier(0.4, 0.0, 1, 1), opacity .3s cubic-bezier(0.4, 0.0, 1, 1);
            border-radius: 5px;
            font-size: 14px;
            font-family: 'Roboto', sans-serif !important;
            color: var(--primary-text-color);
            font-weight: 400;
            line-height: 20px;
            }

            .popover.popover--enabled{
            opacity: 1;
            transform: translateY(0);
        
            }

            #cal1{
            position:absolute;
            height:0px;
            width:0px;
            top:100px;
            left:100px;
            overflow:none;
            z-index:-100;
            }
            #cal2{
            position:absolute;
            height:0px;
            width:0px;
            top:0px;
            left:0px;
            overflow:none;
            z-index:-100;
            }

            .contentGroup{
            min-height: 100px;
            min-width: 500px;
            transition: height .3s cubic-bezier(0.4, 0.0, 1, 1);
            }

            .popoverImage{
            max-width: 200px;
            max-height: 200px;
            background-size: contain;
            border-radius: 0 0 5px 0;
            }

            .popoverText{
            color:#777;
            }

            .popover-navbar{
            display: inline-flex;
            width: -webkit-fill-available;
            align-items: center;
            }

            .popover-navbar .tab {
            padding-top: 13px;
            padding-bottom: 13px;
            flex-grow: 1;
            text-align: center;
            cursor: pointer;
            transition: background-color .3s;
            }

            section.popover-navbar .tab::selection {
            background: rgba(0, 0, 0, 0);
            }

            .popover-navbar .tab:hover{
            background-color: rgba(0, 0, 0, .04);
            }

            .dict-lang--sections:last-child{
            margin-bottom: 10px !important;
            }

            .popover-tab-content{
            display: flex;
            flex-flow: row-reverse;
            padding-left: 10px;
            overflow-x: hidden;
            overflow-y: scroll;
            max-height: 230px;

            }

            .hidden{
            display: none !important;
            }

            .popover-tab-content .dict-lang {
            font-weight: bold;
            font-size: 120%;
            border-bottom: 1px solid rgba(0,0,0,.20);
            margin-bottom: 10px;
            }

            .popover-tab-content .dict-lang:not(:first-child) {
            margin-top: 10px;
            }

            .popover-tab-content .dict-partofspeach {
            font-size: 105%;
            font-weight: 500;
            }

            .popover-tab-content .dict-lang--sections {
            list-style: none;
            padding: initial;
            margin: initial;
            }

            .popover-tab-content:hover::-webkit-scrollbar,
            .popover-tab-content:hover::-webkit-scrollbar-thumb {
            visibility: visible;
            }

            .popover-tab-content::-webkit-scrollbar {
            visibility: hidden;
            width: .2em;
            }

            .popover-tab-content::-webkit-scrollbar-thumb {
            visibility: hidden;
            background-color: darkgrey;
            outline: 1px solid slategrey;
            }

            .self-column{
            display: flex;
            flex-flow: column;
            }

            .popover-arrow{
            width: 0;
            height: 0;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-bottom: 10px solid white;
            z-index: 100000;
            top: -10px;
            position: relative;
            right: -10px;
            }
        </style>
        `;
        const popoverString = `
        <div class="popover" id="wikilink-popover">
            <section id="popoverNavbar" class="popover-navbar">
                <div id="wikiTab" class="tab" target="#wikipediaContent">Wikipedia</div>
                <div id="dictTab" class="tab" target="#dictionaryContent">Dictionary</div>
            </section>
            <main class="contentGroup">
                <section class="popover-tab-content" id="wikipediaContent">
                    <img id="popover-image" class="popoverImage" src="">
                    <p id="wikiText" class="popoverText"></p>
                </section>
                <section class="popover-tab-content self-column hidden" id="dictionaryContent">
                </section>
            </main>
        </div>`;
        

        const popover = document.createRange().createContextualFragment(`${styleString} ${popoverString}`);
        // popover.addEventListener('pointerleave', hideDiv);
        popover.querySelectorAll('.tab').forEach(el => {
            el.addEventListener('click', ev => {
                const pages = popover.querySelectorAll('.popover-tab-content');
                pages.forEach(elem => elem.classList.add('hidden'));
                popover.querySelector(el.attributes.getNamedItem('target').value).classList.remove('hidden');
            });
        });

        return popover;
    }

    /**
     * 
     * @param {object} wikiData The data to show on wikipedia's tab.
     * @param {string} wikiData.body The text body of the definition.
     * @param {string} wikiData.title The text title of the definition.
     * @param {string} wikiData.url The sorce url of the data.
     * @param {object} wiktData The data to show on wiktionary's tab.
     * @param {object} coordinates The coordinates to show the popup.
     * @param {number} coordinates.x The x coordinate to show the popup.
     * @param {number} coordinates.y The y coordinate to show the popup.
     */
    displayData(wikiData, wiktData, coordinates){
        const titleIndex = text.indexOf(wikiData.title);
        const text = wikiData.body.slice(0);
        const newT = text[titleIndex]//will insert an b tag before title

        this.main.wikiContent.querySelector('#wikiText').textContent = wikiData.body;

        //Inserts a <b> tag on title string.
        this.main.wikiContent.querySelector('#wikiText').textContent = wikiData.body;
    }
}