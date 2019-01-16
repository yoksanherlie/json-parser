class JSONParser {

	constructor() {
		this.reset();
	}

	reset() {
		this.index = 0;
		this.length = 0;
		this.data = null;
		this.token = null;
	}

	error(message) {
		this.setToken();
		throw new Error(`Parsing error: ${message ? message : 'Not a valid JSON'}`);
	}

	parse(lexerData) {
		this.reset();
		this.data = lexerData;

		this.data = this.skip(TOKEN_TYPE.WHITESPACE);

		if (this.data[this.index].value !== '{' && this.data[this.index].value !== '[') {
			this.error('JSON should start with a "{" or "["');
		}

		return this.value();
	}

	next() {
		this.index++;
	}

	value() {
		this.setToken();

		if (this.token.type == TOKEN_TYPE.SYMBOL) {
			switch (this.token.value) {
				case '{':
					return this.getObject();
				case '[':
					return this.getArray();
			}
		} else if (this.token.type == TOKEN_TYPE.STRING || this.token.type == TOKEN_TYPE.OTHER) {
			return this.token.value;
		} else if (this.token.type == TOKEN_TYPE.NUMBER) {
			return parseInt(this.token.value);			
		} else if (this.token.type == TOKEN_TYPE.LITERAL) {
			switch (this.token.value) {
				case 'true':
					return true;
				case 'false':
					return false;
				case 'null':
					return null;
			}
		}else {
			return this.error();
		}
	}

	getObject() {
		let obj = {}, key = null;
		if (this.token.value !== '{') return this.error(`Not a valid object at ${this.index}`);
		if (this.data[++this.index].value == '}') return obj;

		do {
			// key of an object
			this.setToken();

			if (this.token.type == TOKEN_TYPE.STRING) {
				key = this.token.value;
				this.index++;
			} else {
				if (this.token.type == TOKEN_TYPE.SYMBOL && this.token.value == '}') {
					this.error(`Unexpected token "${this.data[this.index - 1].value}"`);
				}
				this.error(`Key of an object must be a string`);
			}

			this.setToken();
			// ":" of an object (delimeter) after key
			if (this.token.type != TOKEN_TYPE.SYMBOL && this.token.value != ':') {
				this.error(`Expected ":" after property on object`);
			}

			// value of the object
			this.index++;
			obj[key] = this.value();

			this.index++;
			this.setToken();
			if (this.token.type == TOKEN_TYPE.SYMBOL && this.token.value == '}') {
				return obj;
			}
		} while (this.token.type == TOKEN_TYPE.SYMBOL && this.token.value == ',' && this.index++);
	}

	skip(type) {
		return this.data.filter(token => {
			return token.type != type;
		});
	}

	setToken() {
		this.token = this.data[this.index];
	}
}
