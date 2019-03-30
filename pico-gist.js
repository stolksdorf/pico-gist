const request = require('superagent');

const map    = (obj,fn)=>Object.keys(obj).map((key)=>fn(obj[key],key));
const reduce = (obj,fn,init)=>Object.keys(obj).reduce((acc,key)=>{return fn(acc,obj[key],key); }, init);
const construct = (obj,fn)=>Object.keys(obj).reduce((acc,key)=>{const [a,b]=fn(obj[key],key);acc[a]=b;return acc;}, {});

const types = require('./types.js');

const DefaultOptions = {
	types,
	fields      : {},
	public      : true,
	desc : undefined,
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
				types : Object.assign({}, current.types, newer.types),
				fields : Object.assign({}, current.fields, newer.fields),
			});
		},
		getExt : (name, value, fields={})=>{
			return fields[name] || utils.autofields[name]
				|| (typeof value === 'object' ? 'json' : 'txt');
		},
		// getArgs : (a,b,c)=>{
		// 	if(a[Gist.id]) return { id:a[Gist.id], obj:a, opts:getOpts(b) };
		// 	return { id:a, obj:b, opts:getOpts(c) };
		// },
		gist2Object : (gist, types={})=>{
			const obj = Object.values(gist.files).reduce((acc, file)=>{
				//FIXME: if(file.truncated){}
				const [field, ext] = file.filename.split('.');
				utils.autofields[field] = ext;
				acc[field] = types[ext]
					? types[ext].from(file.content)
					: file.content
				return acc;
			}, {});
			obj[Gist.id] = gist.id;
			obj[Gist.desc] = gist.description;
			return obj;
		},
		object2Files : (obj, fields={}, types={})=>{
			return reduce(obj, (acc, value, field)=>{
				const ext = utils.getExt(field, value, fields);
				const content = types[ext]
					? types[ext].to(value)
					: value;
				acc[`${field}.${ext}`] = { content };
				return acc;
			}, {})
		},
	};

	const Gist = {
		id   : Symbol(),
		desc : Symbol(),
		utils,
		opts : utils.mergeOptions(DefaultOptions, baseOptions),

		getId : (val)=>val[Gist.id] || val,
		getDescription : (val)=>val[Gist.desc] || val,

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
					const {id, description} = gist;
					return {id, desc: description};
				}))
		},
		get : async (id, _opts)=>{
			const opts = getOpts(_opts);
			return Gist.request('get', `/gists/${Gist.getId(id)}`)
				.then((gist)=>utils.gist2Object(gist, opts.types));
		},
		create : async (obj, _opts)=>{
			const opts = getOpts(_opts);
			return Gist.request('post', `/gists`, {
					public      : opts.public,
					description : opts.desc,
					files       : utils.object2Files(obj, opts.fields, opts.types)
				})
				.then((gist)=>utils.gist2Object(gist, opts.types));
		},
		remove : async (id)=>{
			return Gist.request('delete', `/gists/${Gist.getId(id)}`)
		},
		update : async (id, obj, _opts)=>{
			const opts = getOpts(_opts);
			return Gist.request('patch', `/gists/${Gist.getId(id)}`, {
					description : opts.desc,
					files       : utils.object2Files(obj, opts.fields, opts.types)
				})
				.then((gist)=>utils.gist2Object(gist, opts.types));
		},
		append : async (id, obj, _opts)=>{
			const opts = getOpts(_opts);
			const merge = (a, b)=>{
				if(Array.isArray(a)) return a.concat(b);
				if(typeof a === 'object') return Object.assign(a, b);
				return a + b;
			};
			const gist = await Gist.get(id, opts);
			return await Gist.update(id, construct(obj, (val, key)=>[key, merge(gist[key], val)]));
		}
	};
	return Gist;
}