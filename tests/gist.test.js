const test = require('pico-check');
const config = require('./config');

const testGistId = config.get('test_gist_id');
const defaultGist = require('./default.gist.json');

const Gist = require('../src/pico-gist.js')(config.get('gist_token'));

const ResetTestGist = async ()=>{
	const rawGist = await Gist.request('get', `/gists/${testGistId}`);
	const empty = Object.keys(rawGist.files).reduce((acc, fileName)=>{
		acc[fileName]=null;
		return acc;
	}, {});
	await Gist.request('patch', `/gists/${testGistId}`, {
		description : defaultGist.description,
		files : Object.assign(empty, defaultGist.files)
	});
};


test('setup/ensure test gist', async (t)=>ResetTestGist());


test.group('get', (test)=>{
	let gist;
	test('get', async (t)=>{
		gist = await Gist.get(testGistId);
		t.is(gist[Gist.id], testGistId);
		t.is(Gist.getId(gist), testGistId);

		t.is(gist.post, defaultGist.files['post.md'].content);
		t.type(gist.meta, 'object');
		t.is(gist.meta.title, 'hello world.');
		t.is(gist.meta.shared, true);
	});
	test('can get with gist object', async (t)=>{
		gist = await Gist.get(gist);
		t.is(gist[Gist.id], testGistId);
		t.is(Gist.getId(gist), testGistId);
	});

	test('autofields work', async (t)=>{
		if(!gist) gist = await Gist.get(testGistId);
		t.is(Gist.utils.autofields.post, 'md');
		t.is(Gist.utils.getExt('post'), 'md');
	});
});


test.group('fetch', (test)=>{
	let gists;
	test('results should have id & description', async (t)=>{
		if(!gists) gists = await Gist.fetch();
		t.type(gists, 'array');
		t.type(gists[0].id, 'string');
		t.type(gists[0].desc, 'string');
	});

	test('should find test gist', async (t)=>{
		if(!gists) gists = await Gist.fetch();
		const gist = gists.find((gist)=>gist.desc == defaultGist.description);
		t.ok(gist);
	});
});

test.group('update', (test)=>{
	test('setup test gist', async (t)=>ResetTestGist());

	test('update test gist', async (t)=>{
		const updatedGist = await Gist.update(testGistId, {foo : 'bar'});
		t.is(updatedGist.foo, 'bar');
		t.is(updatedGist.post, defaultGist.files['post.md'].content);
	});

	// test('can mutate and update a gist', async (t)=>{
	// 	let gist = await Gist.get(testGistId);
	// 	gist.key = 'val';
	// 	const updatedGist = await Gist.update(gist);
	// 	t.is(updatedGist.key, 'val');
	// });

	test('can update description', async (t)=>{
		const updatedGist = await Gist.update(testGistId, {}, {desc : 'new description'});
		t.is(updatedGist[Gist.desc], 'new description');
	});

	test('cleanup test gist', async (t)=>ResetTestGist());
});


test.group('create & remove', (test)=>{
	let newGist;
	test('create', async (t)=>{
		newGist = await Gist.create({
			meta : { a : true },
			content : 'hello'
		}, {
			public : false,
			desc : 'test',
			fields : { content : 'md' }
		});

		t.is(newGist.content, 'hello');
		t.is(newGist.meta, {a:true});
		t.is(newGist[Gist.desc], 'test');
	});
	test('remove', async (t)=>{
		t.arm();
		await Gist.remove(newGist);
		return Gist.get(newGist)
			.then(()=>t.fail())
			.catch(()=>t.disarm())
	});
});

test('append', async (t)=>{
	const gist = await Gist.append(testGistId, {
		post : '!',
		meta : {
			append : true
		},
		table: [{key:'d', val:8}]
	});

	t.is(gist.post, '# Hello World!');

	t.is(gist.meta.append, true);
	t.is(gist.meta.title, 'hello world.');

	t.is(gist.table[3].key, 'd');
	t.is(gist.table[3].val, '8');
});


test('reset test gist', async (t)=>ResetTestGist());


module.exports = test;