import { IMessage } from "../types/Interfaces";

export class BackgroundCommunicator {
	constructor() {}

	sendMessage(message: IMessage): Promise<any> {
		return new Promise((resolve) => {
			chrome.runtime.sendMessage(message, resolve);
		});
	}
}