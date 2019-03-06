const request = require('superagent');

const map    = (obj,fn)=>Object.keys(obj).map((key, idx)=>fn(obj[key], key, idx));
const reduce = (obj,fn,init)=>Object.keys(obj).reduce((acc, key, idx)=>{return fn(acc, obj[key], key, idx); }, init);

/*
GistAPI(GITHUB_ACCESSTOKEN, {
	fields : {
		info : '.json',
		template : '.jsx',
		data : '.json',
		logic : '.js'
	}
});
*/




module.exports = (token, _opts={})=>{
	const opts = Object.assign({
		filter : (gist)=>true,
		fields : {}
	}, _opts);

	const GistAPI = {
		gist2Object : (gist)=>{
			const obj = {
				id : gist.id,
				description : gist.description
			}
			map(gist.files, (file)=>{
				if(!file.content) return;
				if(file.truncated){
					//FIXME: use the `raw_url` field to fetch the contents directly
					console.log('WOHHHH truncated file!');
				}
				const [field, ext] = file.filename.split('.');
				obj[field] = file.content;
				if(ext == 'json'){ try{ obj[field] = JSON.parse(file.content); }catch(err){}; }
			})
			return obj;
		},
		object2Gist : (obj)=>{
			return {
				description : obj.description,
				files : reduce(obj, (files, content, field)=>{
					if(field == 'id' || field == 'description') return files;
					const ext = opts.fields[field] || (typeof content == 'object') ? '.json' : '.txt';
					files[`${field}${ext}`] = {
						content: (ext == '.json')
							? JSON.stringify(content, null, '\t')
							: content
					};
					return files;
				}, {})
			}
		},
		request : async (verb, path, data={})=>{
			return request
				[verb](`https://api.github.com${path}`)
				.send(data)
				.set('Accept', 'application/vnd.github.v3+json')
				.set('Authorization', `token ${token}`)
				.then((response)=>response.body)
		},
		fetch : async (username = false)=>{
			return GistAPI.request('get', username ? `/users/${username}/gists` : '/gists')
				.then((gists)=>gists
					.filter(opts.filter)
					.map(GistAPI.gist2Object)
				)
		},
		get : async (id)=>{
			if(id.id){id = id.id;}
			return GistAPI.request('get', `/gists/${id}`)
				.then(GistAPI.gist2Object)
		},
		create : async (obj, public=true)=>{
			return GistAPI.request('post', `/gists`, {
				public,
				...GistAPI.object2Gist(obj)
			})
			.then(GistAPI.gist2Object)
		},
		update : async (id, obj)=>{
			if(id.id){obj=id; id = id.id; }
			return GistAPI.request('patch', `/gists/${id}`, GistAPI.object2Gist(obj))
				.then(GistAPI.gist2Object)
		},
		remove : async (id)=>{
			if(id.id){id = id.id;}
			return GistAPI.request('delete', `/gists/${id}`)
		},
	};
	return GistAPI;
}