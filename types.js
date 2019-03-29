const xsv = (delimiter)=>{
	return {
		to : (data)=>{
			const columns = Object.keys(data[0]);
			return columns.join(delimiter) + '\n' +
				data.map((entry)=>{
					return columns.map((fieldName)=>entry[fieldName]).join(delimiter);
				}).join('\n');
		},
		from : (str)=>{
			const [firstRow, ...rest] = str.split('\n');
			const columns = firstRow.split(delimiter);
			return rest.map((line)=>{
				const fields = line.split(delimiter);
				return columns.reduce((acc, name, idx)=>{
					acc[name] = fields[idx];
					return acc;
				}, {})
			});
		}
	}
}

module.exports = {
	tsv: xsv('\t'),
	csv: xsv(','),
	json: {
		from : (str)=>JSON.parse(str),
		to   : (data)=>JSON.stringify(data, null, '  ')
	},
	// txt : {
	// 	to   : (str)=>str,
	// 	from : (data)=>data
	// },



	// //TODO: bump to the examples
	// yaml: {
	// 	to   : (str)=>require('js-yaml').safeDump(str),
	// 	from : (data)=>require('js-yaml').safeLoad(data)
	// },
}