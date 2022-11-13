export class BackgroundCommunicator {
	constructor() {}

	sendMessage(message: IMessage): Promise<any> {
		return new Promise((resolve) => {
			chrome.runtime.sendMessage(message, resolve);
		});
	}
}

export interface IMessage {
	provider: string;
	request: string;
	args: any;
}