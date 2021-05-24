export default class CustomError extends Error {
	constructor(message) {
		super(message);

		this.name = this.constructor.name;
		this.message = message;
		this.stack = new Error(message).stack;
	}
}

export class ValidationError extends CustomError {}
