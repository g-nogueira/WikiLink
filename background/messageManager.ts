import { IMessage } from "./../types/Interfaces";
import { WikipediaRepoMethodNames, WKRepo } from "./WikipediaRepo";
import { WiktionaryRepoMethodNames, WTRepo } from "./WiktionaryRepo";

export function initializeMessageListener() {
	chrome.runtime.onMessage.addListener((request, sender, sendResponde) => {
		processRequest(request).then(sendResponde);
		return true;
	});
}

async function processRequest(request: IMessage) {
	let resp = {};

	if (request.provider === "wp") {
		resp = await WKRepo[request.request as WikipediaRepoMethodNames](request.args);
	} else if (request.provider === "wt") {
		resp = await WTRepo[request.request as WiktionaryRepoMethodNames](request.args);
	}

	return resp;
}
