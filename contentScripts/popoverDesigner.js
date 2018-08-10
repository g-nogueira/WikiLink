'use strict';


const popoverDesigner = {

	getBasicShell: () => {

		return getBasicShell();

		/**
		 * Generates the popover main structure without any data.
		 * @returns {DocumentFragment} A popover documentFragment.
		 */
		function getBasicShell() {
			var elementString = '';
			var styleString = getPopoverStyles();
			var popoverElement = new DocumentFragment();
			//<div class="popover-arrow"></div>

			elementString = `
            <div id="popover" class="js-popover">
                <section id="navbar">
                    <div class="tab btn--navigator js-tab js-wikiTab js-wikiNavigator" target=".js-wikiSect"><=</div>
                    <div class="tab js-tab js-wikiTab" target=".js-wikiSect">Wikipedia</div>
                    <div class="tab js-tab js-wiktTab" target=".js-wiktSect">Dictionary</div>
                </section>
                <main class="contentGroup">
                    <section id="wikiSect" class="js-wikiSect js-infoSect info-section">
                    </section>
                    <section id="dictionaryContent" class="js-wiktSect js-infoSect info-section self-column hidden">
                    </section>
                </main>
            </div>`;

			popoverElement = document.createRange().createContextualFragment(`${styleString} ${elementString}`);

			popoverElement.querySelectorAll('.js-tab').forEach(el => {
				el.addEventListener('click', ev => {
					const popover = ev.path.find(el => el.classList.contains('js-popover'));
					const infoSections = popover.querySelectorAll('.js-infoSect');

					if (!el.hasAttribute('disabled') && !el.classList.contains('js-wikiNavigator')) {
						infoSections.forEach(section => section.classList.add('hidden')); //Hides all pages/info-sections
						popover.querySelector(el.attributes.getNamedItem('target').value).classList.remove('hidden'); //Find the target info-section and shows it
                    } 
                    else if (el.classList.contains('js-wikiNavigator') && popover.querySelector('.js-wikiArticle')) {
                        let article = popover.querySelector('.js-wikiArticle');
                        infoSections.forEach(section => section.classList.add('hidden')); //Hides all pages/info-sections
                        popover.querySelector(el.attributes.getNamedItem('target').value).classList.remove('hidden'); //Find the target info-section and shows it
                        popover.querySelector(el.attributes.getNamedItem('target').value).classList.add('list'); //Find the target info-section and shows it
                        popover.querySelector(el.attributes.getNamedItem('target').value).removeChild(article); //Find the target info-section and shows it
                        popover.querySelector('.js-wikiSearches').classList.remove('hidden');


                    }
				});
			});

			popoverElement = insertBlankList(popoverElement);

			return popoverElement;
		}

        function removeChildrenFrom(element) {
            while (element.hasChildNodes()) {
                element.removeChild(element.lastChild);
            }
    
            return element;
        }

		function insertBlankList(popover) {

			var wikiSect = popover.querySelector('.js-wikiSect');
			var wikiList = document.createElement('div');
			wikiList.id = 'wikiSearches';
			wikiList.classList.add('js-wikiSearches');

			let content = generateBlankWikiList();

			wikiSect.classList.add('list');

			wikiSect.appendChild(content);

			return popover;
		}

		function generateBlankWikiList() {

			var section = document.createDocumentFragment();

			for (let i = 0; i < 6; i++) {
				let frag = `
                <div class="js-item item item--blank">
                    <section class="image--blank"></section>
                    <section class="info">
                        <div class="js-title title--blank"></div>
                        <div class="description--blank"></div>
                        <div class="description--blank"></div>
                    </section>
                </div>`;

				section.appendChild(document.createRange().createContextualFragment(frag).firstElementChild);
			}

			return section;
		}

		function getPopoverStyles() {
			return `
        <style>
            :root{
                --primary-text-color: rgba(0, 0, 0, 0.87);
                --secundary-text-color: rgba(0, 0, 0, 0.54);
                --disabled-text-color: rgba(0, 0, 0, 0.38);
            }
            #popover{
                all: initial;
            }
            #popover {
                will-change: opacity;
                position:absolute;
                opacity: 0;
                background:#ffffff;
                width:auto;
                max-width: 500px;
                box-shadow:0 30px 90px -20px rgba(0,0,0,0.3), 0 0 1px #a2a9b1;
                text-align: left;
                z-index: -10;
                transform: translateY(10%);
                transition: transform 0.2s cubic-bezier(0.4, 0.0, 1, 1), opacity .2s, z-index .5s;
                border-radius: 5px;
                font-size: 14px;
                font-family: 'Roboto', sans-serif !important;
                color: rgba(0,0,0,.87);
                font-weight: 400;
                line-height: 20px;
            }
            
            #popover.popover--enabled{
                display:block;
                opacity: 1;
                transform: translateY(0);
                z-index: 10;
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
                // min-height: 200px;
                min-width: 500px;
                transition: height .3s cubic-bezier(0.4, 0.0, 1, 1);
            }

            #wikiSect #wikiArticle{
                display: flex;
                flex-flow: row-reverse;
            }

            #wikiSect .wikiArticle--blank{
                width: 100%;
            }

            #wikiSect .wikiArticle--blank .text--blank{
                display: flex;
                flex-direction: column;
                flex-grow: 1;
            }
            
            .popoverImage,
            .popoverImage--blank{
                max-width: 200px;
                max-height: 200px;
                background-size: contain;
                border-radius: 0 0 5px 0;
            }

            .popoverImage--blank{
                width: 200px;
                height: 200px;
                background-color: #fafafa;
            }
            
            .popoverText{
                font-family: sans-serif;
                font-size: 14px;
                line-height: 20px;
                color:#777;
                overflow-x: hidden;
                overflow-y: scroll;
                margin: 0;
            }
            
            #navbar{
                display: inline-flex;
                width: -webkit-fill-available;
                align-items: center;
            }
            
            #navbar .tab {
                padding-top: 13px;
                padding-bottom: 13px;
                flex-grow: 1;
                text-align: center;
                cursor: pointer;
                transition: background-color .3s;
            }
            
            #navbar .tab.btn--navigator {
            //     position: absolute;
            //     left: 5%;
                flex-grow: 0.25;
            }

            #navbar .tab::selection {
                background: rgba(0, 0, 0, 0) !important;
            }
            
            #navbar .tab:hover{
                background-color: rgba(0, 0, 0, .04);
            }

            #navbar .tab[disabled]{
                color: rgba(0,0,0,.50);
                cursor: unset;
            }

            #navbar .tab[disabled]:hover{
                background-color: #fff;
            }
            
            #dictionaryContent{
                overflow-x: hidden;
                overflow-y: scroll;
            }
            .dict-lang--sections:last-child{
                margin-bottom: 10px !important;
            }
            
            .info-section{
                display: flex;
                flex-flow: row-reverse;
                padding-left: 10px;
                overflow: hidden;
                max-height: 230px;
            }

            .info{
                width: 100%;
                height: auto;
                align-self: flex-start;
            }
            
            #wikiSect:not(.list){
                margin-right: -1.3px;
            }

            .info-section.list{
                overflow-x: hidden;
                overflow-y: scroll;
            }
            
            .hidden{
                display: none !important;
            }
            
            .info-section .dict-lang {
                font-weight: bold;
                font-size: 120%;
                border-bottom: 1px solid rgba(0,0,0,.20);
                margin-bottom: 10px;
                // overflow-y: scroll;
            }
            
            .info-section .dict-lang:not(:first-child) {
                margin-top: 10px;
            }
            
            .info-section .dict-partofspeach {
                font-size: 105%;
                font-weight: 500;
            }
            
            .info-section .dict-lang--sections {
                list-style: none;
                padding: initial;
                margin: initial;
            }
            
            .popoverText:hover::-webkit-scrollbar,
            .info-section.list:hover::-webkit-scrollbar,
            #dictionaryContent.info-section:hover::-webkit-scrollbar,
            .popoverText:hover::-webkit-scrollbar-thumb,
            .info-section.list:hover::-webkit-scrollbar-thumb,
            #dictionaryContent.info-section:hover::-webkit-scrollbar-thumb {
                visibility: visible !important;
            }
            
            .popoverText::-webkit-scrollbar,
            .info-section.list::-webkit-scrollbar,
            #dictionaryContent.info-section::-webkit-scrollbar {
                visibility: hidden;
                width: .2em !important;
            }
            
            .popoverText::-webkit-scrollbar-thumb,
            .info-section.list::-webkit-scrollbar-thumb,
            #dictionaryContent.info-section::-webkit-scrollbar-thumb {
                visibility: hidden;
                background-color: darkgrey !important;
                outline: 1px solid slategrey !important;
            }
            
            .self-column{
                display: flex;
                flex-flow: column;
            }
            
            ol{
                -webkit-padding-start: 40px !important;
                margin: 0 !important;
            }
            
            ol li{
                list-style-type: decimal !important;
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

            #wikiSect.list,
            #wikiSect #wikiSearches{
                display: flex;
                flex-direction: column;
                min-height: 230px;
            }
            
            #wikiSect.list .item{
                display: inline-flex;
                align-items: center;
                flex-shrink: 0;
                padding: 5px 8px 5px 0;
                border-bottom: 1px solid rgba(0,0,0, .2);
                cursor: pointer;
            }
            
            #wikiSect.list .title{
                font-weight: 500;
                font-size: 100%;
            }

            #wikiSect.list .title--blank{
                width: 50%;
                height: 15px;
                margin-bottom: 10px;
                background-color: #fafafa;
            }
            
            
            #wikiSect.list .description{
                font-size: 90%;
                line-height: initial;
                color: rgba(0, 0, 0, 0.54);
            }
            
            #wikiSect.list .description--blank{
                width: 80%;
                height: 10px;
                margin-top: 2.5px;
                background-color: #fafafa;
            }
            
            #wikiSect .description--blank{
                width: 95%;
                height: 13px;
                margin-top: 8px;
                background-color: #fafafa;
            }
            #wikiSect .description--blank:nth-child(3n+0){
                width: 70%;
            }

            #wikiSect.list .description--blank:last-child,
            #wikiSect .description--blank:last-child{
                width: 70%;
            }
            
            #wikiSect.list .image,
            #wikiSect.list .image--blank{
                width: 70px;
                height: 70px;
                display: flex;
                align-items: center;
                margin: 0 10px 0 0;
                overflow: hidden;
                flex-shrink: 0;
            }

            #wikiSect.list .image--blank{
                background-color: #fafafa;
            }

            #wikiSect a{
                text-decoration: none;
                color: inherit;
            }
        </style>`;

		}
	}

}