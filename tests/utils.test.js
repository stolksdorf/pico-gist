const test = require('pico-check');
const config = require('./config');

const Gist = require('../src/pico-gist.js')(config.get('gist_token'));
const types = require('../src/base.types.js');

const defaultGist = require('./default.gist.json');

test.group('mergeOptions', (test)=>{
	test('core options are merged', (t)=>{
		const res = Gist.utils.mergeOptions(
			{a : 6, b : 55},
			{c : 7, b : 5}
		);
		t.is(res.a, 6);
		t.is(res.b, 5);
		t.is(res.c, 7);
	});


	test('types are merged', (t)=>{
		const res = Gist.utils.mergeOptions(
			{types: {a : 6, b : 55}},
			{types: {c : 7, b : 5}}
		);
		t.is(res.types.a, 6);
		t.is(res.types.b, 5);
		t.is(res.types.c, 7);
	});

	test('fields are merged', (t)=>{
		const res = Gist.utils.mergeOptions(
			{fields: {a : 6, b : 55}},
			{fields: {c : 7, b : 5}}
		);
		t.is(res.fields.a, 6);
		t.is(res.fields.b, 5);
		t.is(res.fields.c, 7);
	});

});

test.group('gist2Object', (test)=>{
	test('basic', (t)=>{
		const obj = Gist.utils.gist2Object(defaultGist, types);

		t.type(obj.table, 'array');
		t.is(obj.table[0].key, 'a');
		t.is(obj.table[0].val, '5');
		t.is(obj.table[1].key, 'b');
		t.is(obj.table[1].val, '6');
		t.is(obj.table[2].key, 'c');
		t.is(obj.table[2].val, '7');

		t.type(obj.meta, 'object');
		t.is(obj.meta.shared, true);
		t.is(obj.meta.title, 'hello world.');

		t.is(obj.post, '# Hello World');

		t.is(obj[Gist.id], defaultGist.id);
		t.is(obj[Gist.desc], defaultGist.description);
	});
});

test.group('object2Gist', (test)=>{
	test('extra types work', (t)=>{
		const gist = Gist.utils.object2Gist({
			text : 'yo',
			meta : { a : true }
		}, {types});

		t.is(gist.files['text.txt'], { content: 'yo'});
		t.is(gist.files['meta.json'], { content: '{\n  "a": true\n}'});
	});

	test('custom fields work', (t)=>{
		const gist = Gist.utils.object2Gist({
			markdown : 'yo'
		}, {fields: {markdown : 'md'}});

		t.is(gist.files['markdown.md'], { content: 'yo'});
	});

	test('public flag and description work', (t)=>{
		const gist = Gist.utils.object2Gist({
			text : 'yo',
		}, {public: false, desc: 'test'});

		t.is(gist.public, false);
		t.is(gist.description, 'test');
	});
});


module.exports = test;