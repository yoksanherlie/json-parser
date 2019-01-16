let jsonLexer = null,
	jsonParser = null;
let $ = document.querySelector.bind(document),
	wrapper = null;
let tree = null;

function init() {
	jsonLexer = new JSONLexer();
	jsonParser = new JSONParser();

	fetch('https://api.github.com/users/yoksanherlie')
		.then(response => response.text())
		.then(res => {
			let lexResult = jsonLexer.lex(res);

			let json = jsonParser.parse(lexResult);

			wrapper = $('#wrapper');
			tree = jsonTree.create(json, wrapper);
			tree.expand();
		});
}

$('#source_text').addEventListener('input', () => {
	let source = $('#source_text').value;
	let lexResult = jsonLexer.lex(source);

	let result = jsonParser.parse(lexResult);

	if (result) {
		tree.loadData(result);
	} else {
		console.log('error');
		console.log(result);
	}
});

$('#load_from_url').addEventListener('click', () => {
	$('#modal_url').classList.add('active');
});

$('#load_url_button').addEventListener('click', () => {
	fetchFromUrl($('#load_url').value);
});


function fetchFromUrl(url) {
	fetch(url)
		.then(response => response.text())
		.then(res => {
			let lexResult = jsonLexer.lex(res);
			let result = jsonParser.parse(lexResult);

			if (result) {
				tree.loadData(result);
				$('#source_text').value = res;
				$('#modal_url').classList.remove('active');
				$('#load_url').value = '';
			}
		})
}

window.onload = init();