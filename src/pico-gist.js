const request = require('superagent');
const types = require('./base.types.js');
const construct = (obj,fn)=>Object.keys(obj).reduce((acc,key)=>{const [a,b]=fn(obj[key],key);acc[a]=b;return acc;}, {});

const DefaultOptions = {
	types,
	fields : {},
	public : true,
	desc   : undefined,
};

module.exports = (token, baseOptions)=>{
	const getOpts = (override)=>{
		if(!override) return Gist.opts;
		return utils.mergeOptions(Gist.opts, override);
	};

	const utils = {
		autofields : {},
		mergeOptions : (current={}, newer={})=>{
			return Object.assign({}, current, newer, {
				types  : Object.assign({}, current.types, newer.types),
				fields : Object.assign({}, current.fields, newer.fields),
			});
		},
		mergeValues : (a, b)=>{
			if(Array.isArray(a)) return a.concat(b);
			if(typeof a === 'object') return Object.assign(a, b);
			return a + b;
		},
		getExt : (name, value, fields={})=>{
			return fields[name] || utils.autofields[name]
				|| (typeof value === 'object' ? 'json' : 'txt');
		},
		getType : (ext, types)=>{
			if(types && types[ext]) return types[ext];
			return { to:(a)=>a,from:(a)=>a };
		},
		gist2Object : (gist, types={})=>{
			const obj = construct(gist.files, (file)=>{
				const [field, ext] = file.filename.split('.');
				utils.autofields[field] = ext;
				return [field, utils.getType(ext, types).from(file.content)];
			});
			obj[Gist.id] = gist.id;
			obj[Gist.desc] = gist.description;
			return obj;
		},
		object2Gist : (obj, opts={})=>{
			return {
				public      : opts.public,
				description : opts.desc,
				files       : construct(obj, (value, field)=>{
					const ext = utils.getExt(field, value, opts.fields);
					const content = utils.getType(ext, opts.types).to(value);
					return [`${field}.${ext}`, { content }];
				})
			}
		},
	};

	const Gist = {
		utils,

		id      : Symbol(),
		desc    : Symbol(),
		getId   : (val)=>val[Gist.id] || val,
		getDesc : (val)=>val[Gist.desc] || val,

		opts : utils.mergeOptions(DefaultOptions, baseOptions),

		request : async (verb, path, data={})=>{
			return request
				[verb](`https://api.github.com${path}`)
				.send(data)
				.set('Accept', 'application/vnd.github.v3+json')
				.set('Authorization', `token ${token}`)
				.then((response)=>response.body)
		},
		fetch : async (username=false)=>{
			return Gist.request('get', username ? `/users/${username}/gists` : '/gists')
				.then((gists)=>gists.map((gist)=>{
					return {id:gist.id, desc: gist.description};
				}));
		},
		get : async (id, _opts)=>{
			const opts = getOpts(_opts);
			return Gist.request('get', `/gists/${Gist.getId(id)}`)
				.then((gist)=>utils.gist2Object(gist, opts.types));
		},
		remove : async (id)=>{
			return Gist.request('delete', `/gists/${Gist.getId(id)}`)
		},
		create : async (obj, _opts)=>{
			const opts = getOpts(_opts);
			return Gist.request('post', `/gists`, utils.object2Gist(obj, opts))
				.then((gist)=>utils.gist2Object(gist, opts.types));
		},
		update : async (id, obj, _opts)=>{
			const opts = getOpts(_opts);
			return Gist.request('patch', `/gists/${Gist.getId(id)}`, utils.object2Gist(obj, opts))
				.then((gist)=>utils.gist2Object(gist, opts.types));
		},
		append : async (id, obj, _opts)=>{
			const opts = getOpts(_opts);
			const gist = await Gist.get(id, opts);
			const mergedObj = construct(obj,(val, key)=>[key, utils.mergeValues(gist[key], val)])
			return await Gist.update(id, mergedObj, opts);
		},
	};
	return Gist;
}