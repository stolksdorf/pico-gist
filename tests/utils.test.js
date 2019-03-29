const test = require('pico-check');
const config = require('./config');

const Gist = require('../pico-gist.js')(config.get('gist_token'));

const types = require('../types.js');

//const testGistId = config.get('test_gist_id');
const sampleGist = require('./sample.gist.js');



test.group('mergeOptions', (test)=>{
	test('core options are merged', (t)=>{
		const res = Gist.utils.mergeOptions(
			{a : 6, b : 55},
			{c : 7, b : 5}
		);
		t.is(res.a, 6);
		t.is(res.b, 5);
		t.is(res.c, 7);
	})


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
		const obj = Gist.utils.gist2Object(sampleGist, types);

		t.type(obj.table, 'array');
		t.is(obj.table[0].val, 'a');
		t.is(obj.table[0].key, '6');

		t.type(obj.meta, 'object');
		t.is(obj.meta.a, true);

		t.is(obj.hello_world, 'Hello world!');

		t.is(obj[Gist.id], sampleGist.id);
		t.is(obj[Gist.description], sampleGist.description);
	});
});


test.group('object2Files', (test)=>{
	test('basic', (t)=>{
		const files = Gist.utils.object2Files({
			text : 'yo',
			meta : { a : true }
		}, {}, types);

		t.is(files['text.txt'], { content: 'yo'});
		t.is(files['meta.json'], { content: '{\n  "a": true\n}'});
	});

	test('custom fields work', (t)=>{
		const files = Gist.utils.object2Files({
			text : 'yo'
		}, {text : 'md'});

		t.is(files['text.md'], { content: 'yo'});
	});
});






module.exports = test;