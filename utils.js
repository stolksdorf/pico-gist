module.exports = {

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

};
