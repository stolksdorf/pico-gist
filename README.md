# 🗃 pico-gist
An incredibly tiny library for using [github gists](https://gist.github.com/) as a datastore.

[![npm version](https://badge.fury.io/js/pico-gist.svg)](https://badge.fury.io/js/pico-gist)


Excellent for prototyping, and personal projects that have small data storage requirements. `picogist` maps files in gists to key-value pairs in objects.

[Check out the Gist used in the example below!](https://gist.github.com/stolksdorf/4c418059103b81ea893e5fe103f6c7c0)

```js
const Gist = require('pico-gist')('YOUR_GITHUB_TOKEN');
const gist = await Gist.get('4c418059103b81ea893e5fe103f6c7c0');

console.log(gist);
/*
{
	table : [
		{key:'a', val:'5'},
		{key:'b', val:'6'},
		{key:'c', val:'7'},
	],
	post : '# Hello world',
	meta : {
		shared : true,
		title  : 'hello world.'
	}
}
*/

gist[Gist.id] //'4c418059103b81ea893e5fe103f6c7c0'
gist[Gist.desc] //"[pico-gist] Testing Gist"
```




### Options
```
//TODO:
types,
fields      : {},
public      : true,
desc : undefined,
```


### API

##### `picogist(github_token, [opts])` -> picogist instance
Creates a picogist instance configured with the provided token and any base options. You can create a Personal Access Token by [going here](https://github.com/settings/tokens), it only needs the `gist` scope. _keep this secret and safe_.

```js
const Gist = require('pico-gist')('YOUR_GITHUB_TOKEN', { fields : {body : 'md'}});

const gists = await Gist.fetch();

```


##### `.fetch([username])` -> array of {id, desc}
Fetches all public gists from the user if `username` is provided. Otherwise fetches both public and privates gists of the owner of the `github_token`. Will not return any content relating to the gists, just their `id` and `desc`.

```js
const gists = await Gist.fetch('stolksdorf');

/*
  [
    {
       id : 'abc123',
       desc: 'My gist...'
    },
    ...
  ]
*/
```

##### `.get(gistId, [opts])` -> object
Retrieves the gist at `gistId`. Will convert all the content of the files into an object where the keys are the filename (without extensions), and the values are the content converted based on `opts.types`. Both the `id` and `desc` are stored on the resulting object by Symbols. Use `obj[Gist.id]`/`obj[Gist.desc]` to access them.

```js
/* Example Gist
{
	"id": "4c418059103b81ea893e5fe103f6c7c0",
	"description": "[pico-gist] Testing Gist",
	"files" : {
		"table.csv":{
			"content": "key,val\na,5\nb:6\nc:7"
		},
		"post.md":{
			"content": "# Hello World"
		},
		"meta.json":{
			"content" : "{\"title\":\"hello world.\",\"shared\":true}"
		}
	},
	...
}
*/

const gist = await Gist.get('4c418059103b81ea893e5fe103f6c7c0');

console.log(gist);
/*
{
	table : [
		{key:'a', val:'5'},
		{key:'b', val:'6'},
		{key:'c', val:'7'},
	],
	post : '# Hello world',
	meta : {
		shared : true,
		title  : 'hello world.'
	}
}
*/

gist[Gist.id] //'4c418059103b81ea893e5fe103f6c7c0'
gist[Gist.desc] //"[pico-gist] Testing Gist"
```



##### `.create(data, [opts])`
Creates a new gist with the given `data` and `opts`. You can set the description using `opts.desc`. The fields will be converted using the `opts.types`, and their file extensions will be determined using `opts.fields`.

```js
const newGist = await Gist.create({post : 'hey!'}, {desc: 'My new Post', fields:{post:'md'}});

newGist.post -> 'hey!'
newGist[Gist.id] -> 'abc123'
```

##### `.remove(gistId)`
Deletes the gist.


##### `.update(gistId, data, [opts])`
Will update the gist at `gistId` with the given data. Github will merge and overwrite the new data on the gist. To delete a file/field, set it's value to `null`. You can set the description using `opts.desc`. The fields will be converted using the `opts.types`, and their file extensions will be determined using `opts.fields`.

```js
const updatedGist = await Gist.update('abc123' {post : 'hello there'});

updatedGist.post -> 'hello there'
```


##### `.append(gistId, data, [opts])`
Attempts to get, merge, and then update. Uses `Object.assign` for all object types, sums if numbers, concats if arrays, and appends if the field is a string.

```js
const updatedGist = await Gist.append('abc123', {post : ', good lookin'});

updatedGist.post -> 'hello there, good lookin'
```


