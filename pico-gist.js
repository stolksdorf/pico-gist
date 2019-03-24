const request = require('superagent');

const map    = (obj,fn)=>Object.keys(obj).map((key, idx)=>fn(obj[key], key, idx));
const reduce = (obj,fn,init)=>Object.keys(obj).reduce((acc, key, idx)=>{return fn(acc, obj[key], key, idx); }, init);

module.exports = (token, baseOptions=null)=>{
	let autofields = {};

	const utils = {
		mergeOptions : (current, newer)=>{
			//TODO:
			const defaultOptions = {
				exts        : null, //todo: add json, tsv, csv,
				fields      : null,
				public      : true,
				description : null,
				filter      : null,
			};
		},
		getExt : (name, value, opts)=>{
			if(opts.fields[name]) return opts.fields[name];
			if(autofields[name]) return autofields[name];
			if(typeof value === 'object') return 'json';
			return 'txt';
		},

		gist2Object : (gist, opts={exts:{}})=>{
			const obj = Object.values(gist.files).reduce((acc, file)=>{
				//if(file.truncated){}
				const [field, ext] = file.filename.split('.');
				autofields[field] = ext;
				acc[field] = opts.exts[ext]
					? opts.exts[ext].to(file.contents)
					: file.contents
				return acc;
			}, {});
			obj[Gist.id] = gist.id;
			obj[Gist.description] = gist.description;
			return obj;
		},
		object2Files : (obj, opts={exts:{}})=>{
			return reduce(obj, (acc, value, field)=>{
				const ext = getExt(field, value, opts);
				const content = opts.exts[ext]
					? opts.exts[ext].from(value)
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




		request : async (verb, path, data={})=>{
			return request
				[verb](`https://api.github.com${path}`)
				.send(data)
				.set('Accept', 'application/vnd.github.v3+json')
				.set('Authorization', `token ${token}`)
				.then((response)=>response.body)
		},




		fetch : async (username=false, _opts={})=>{
			const opts = mergeOptions(baseOptions, _opts);
			return Gist.request('get', username ? `/users/${username}/gists` : '/gists')
				.then((gists)=>(opts.filter) ? gists.filter(opts.filter) : gists) //Maybe remove?
				.then((gists)=>gists.map((gist)=>{
					const {id, description} = gist;
					return {id, description};
				}))
		},
		get : async (id)=>{
			if(id[Gist.id]){obj=id; id = id[Gist.id] }
			return Gist.request('get', `/gists/${id}`)
				.then(utils.gist2Object)
		},
		create : async (obj, _opts={})=>{

			// {
			// 	files : object2Files(obj, )
			// }


			return Gist.request('post', `/gists`, {
				public,
				...Gist.object2Gist(obj)
			})
			.then(utils.gist2Object)
		},
		update : async (id, obj, _opts={})=>{
			if(id[Gist.id]){obj=id; id = id[Gist.id] }
			return Gist.request('patch', `/gists/${id}`, Gist.object2Gist(obj))
				.then(utils.gist2Object)
		},
		remove : async (id)=>{
			if(id[Gist.id]){obj=id; id = id[Gist.id] }
			return Gist.request('delete', `/gists/${id}`)
		},
		append : async (id, obj)=>{
			let temp = await Gist.get(id);
			map(obj, (val, key)=>{
				obj[key] = (typeof temp[key] === 'object')
					? Object.assign(temp[key], val);
					: temp[key] + val;
			});
			return await Gist.update(id, temp);
		}
	};
	return Gist;
}