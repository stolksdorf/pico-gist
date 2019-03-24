const test = require('pico-check');
const config = require('./config');

const PicoGist = require('../pico-gist.js');
const Gist = PicoGist(config.get('gist_token'));

const testGistId = config.get('test_gist_id');


test.only('temp', async (t)=>{
	console.log(config.get('gist_token'));


	const res = await Gist.fetch();





	console.log(res);

})



test('get', async (t)=>{
	const gist = await Gist.get(testGistId);
	t.is(gist.id, testGistId);
});
test('can get with object', async (t)=>{
	const gist = await Gist.get({id: testGistId});
	t.is(gist.id, testGistId);
});


test('fetch and filter', async (t)=>{
	const Gist = PicoGist(config.get('gist_token'), {
		filter : (gist)=>gist.description.startsWith('[pico-gist]')
	});
	const gists = await Gist.fetch();
	t.is(gists.length, 1);
});

test('update test gist', async (t)=>{
	const gist = await Gist.get(testGistId);
	gist.raw_data = { test : 6, foo : true }

	const updatedGist = await Gist.update(gist);

	t.is(updatedGist.raw_data, gist.raw_data);
	t.is(updatedGist, gist);
});


test('create and remove', async (t)=>{



});

test.group('.append()', (test)=>{


})






module.exports = test;