const request = require('superagent');

const map    = (obj,fn)=>Object.keys(obj).map((key, idx)=>fn(obj[key], key, idx));
const reduce = (obj,fn,init)=>Object.keys(obj).reduce((acc, key, idx)=>{return fn(acc, obj[key], key, idx); }, init);
const types = require('./types.js');

const DefaultOptions = {
	types,
	fields      : {},
	public      : true,
	description : undefined,
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
			obj[Gist.description] = gist.description;
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
		id          : Symbol(),
		description : Symbol(),
		utils,
		opts : utils.mergeOptions(DefaultOptions, baseOptions),

		getId : (val)=>val[Gist.id] || val,
		getDescription : (val)=>val[Gist.description] || val,

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
					return {id, description};
				}))
		},
		get : async (id, _opts)=>{
			const opts = getOpts(_opts);
			return Gist.request('get', `/gists/${Gist.getId(id)}`)
				.then((gist)=>Gist.utils.gist2Object(gist, opts.types));
		},
		create : async (obj, _opts)=>{
			const opts = getOpts(_opts);
			return Gist.request('post', `/gists`, {
					public : opts.public,
					description : opts.description,
					files       : Gist.utils.object2Files(obj, opts.fields, opts.types)
				})
				.then((gist)=>Gist.utils.gist2Object(gist, opts.types));
		},
		update : async (id, obj, _opts)=>{
			const opts = getOpts(_opts);
			return Gist.request('patch', `/gists/${Gist.getId(id)}`, {
					description : opts.description,
					files       : Gist.utils.object2Files(obj, opts.fields, opts.types)
				})
				.then((gist)=>Gist.utils.gist2Object(gist, opts.types));
		},
		remove : async (id)=>{
			return Gist.request('delete', `/gists/${Gist.getId(id)}`)
		},
		append : async (id, obj)=>{
			let currValue = await Gist.get(id);
			map(obj, (val, key)=>{
				currValue[key] = (typeof currValue[key] === 'object')
					? Object.assign(currValue[key], val)
					: currValue[key] + val;
			});
			return await Gist.update(id, currValue);
		}
	};
	return Gist;
}