class JSONLexer {

	constructor() {
		this.reset();

		this.unescapes = {
			'\\': '\\',
			'"': '"',
			'/': '/',
			'b': '\b',
			't': '\t',
			'n': '\n',
			'r': '\r',
			'f': '\f'
		};
	}

	reset() {
		this.result = [];
		this.index = 0;
		this.source = null;
		this.length = 0;
	}

	error(message) {
		throw new Error(`Lexical analysis error: ${message}`);
	}

	lex(jsonSource) {
		this.reset();

		this.source = jsonSource;
		this.length = this.source.length;
		
		let token = null;
		do {
			token = this.next();
			if (token) this.result.push(token);
		} while (token);

		return this.result;
	}

	next() {
		let char, begin, charCode, string;
		while (this.index < this.length) {
			char = this.source[this.index];

			switch (char) {
				case '{':
				case '}':
				case ':':
				case ',':
				case '[':
				case ']':
					this.index++;
					return { type: TOKEN_TYPE.SYMBOL, value: char };
				case ' ':
				case '\n':
				case '\r':
				case '\t':
					// this.index++;
					string = this.source[this.index];
					while ('\t\n\r '.indexOf(this.source[++this.index]) !== -1) {
						string += this.source[this.index];
					}
					return { type: TOKEN_TYPE.WHITESPACE, value: string };
				case '"': // start of the string
					let stringStartIndex = this.index;
					begin = -1;

					for (string = '', this.index++; this.index < this.length;) {
						char = this.source[this.index];
						if (char === '\\') {
							char = this.source[++this.index];
							switch (char) {
								case '\\':
								case '"':
								case '/':
								case 'b':
								case 't':
								case 'n':
								case 'f':
								case 'r':
									string += this.unescapes[char];
									this.index++;
									break;
								default:
									return this.error();
							}
						} else {
							if (char === '"') {
								break;
							}
							begin = this.index;

							charCode = this.source.charCodeAt(this.index);
							while (charCode >= 32 && charCode !== 92 && charCode !== 34) {
								charCode = this.source.charCodeAt(++this.index);
							}
							string += this.source.slice(begin, this.index);
						}
					}

					if (this.source[this.index] == '"') {
						this.index++;
						let rawString = this.source.slice(stringStartIndex, this.index);
						return { type: TOKEN_TYPE.STRING, value: string, raw: rawString };
					}
					return this.error(`Unterminated string on index ${stringStartIndex}.`);
					break;
				default: // number and literals (keywords: true, false, null)
					begin = this.index;

					// number
					charCode = this.source.charCodeAt(this.index);
					if (charCode >= 48 && charCode <= 57) {
						while (this.index < this.length && (charCode >= 48 && charCode <= 57)) {
							this.index++;
							charCode = this.source.charCodeAt(this.index);
						}

						let numberString = this.source.slice(begin, this.index);
						return { type: TOKEN_TYPE.NUMBER, value: numberString };
					}

					// literal (keywords)
					let literal = this.source.slice(this.index, this.index + 4);
					if (literal == 'true') {
						this.index += 4;
						return { type: TOKEN_TYPE.LITERAL, value: 'true' };
					} else if (literal == 'fals' && this.source[this.index + 4] == 'e') {
						this.index += 5;
						return { type: TOKEN_TYPE.LITERAL, value: 'false' };
					} else if (literal == 'null') {
						this.index += 4;
						return { type: TOKEN_TYPE.LITERAL, value: 'null' };
					}
					this.index++;
					return { type: TOKEN_TYPE.OTHER, value: char };
					// return this.error(`Unrecognized token '${char}'.`);
					break;
			}
		}
		return false;
	}
}