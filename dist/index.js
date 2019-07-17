var watch = require('node-watch');
var path = require('path');
const fs = require('fs-extra');

// let watcher = watch(__dirname, 
// 		{ 
// 			recursive: true,
// 			delay: 1000, 
// 			filter: f => {
// 				return !/{node_modules, dist}/.test(f)
// 			}
// 		}, 
// 			onFileChange
// 	);

// function onFileChange(event, filename) {
// 	// console.log(event, filename);
// }

// watcher.on('change', (e, name) => {
// 	console.log(e, name, 'lll');
// });



let ParallelSpace = class {
	constructor(from, to){
		this.from = from;
		this.to = to;
		this.signal = null;
	}

	run() {
		// for type system
		this.signal = watch(this.from.config.root, this.from.config);
		this.signal.on('change', (e, file) => {
			if(e == 'update'){
				let updateFile = path.join(this.to.config.root, file.slice(this.from.config.root.length));
				let folder = path.dirname(updateFile);
				console.log('updating', updateFile);
				fs.mkdirsSync(folder);
				fs.createReadStream(file).pipe(fs.createWriteStream(updateFile))
					.on('close', ()=>{
						console.log('done');
					});
			}
			else if(e == 'remove') {
				let updateFile = path.join(this.to.config.root, file.slice(this.from.config.root.length));
				fs.remove(updateFile);
			}else {
				console.log(e);
			}
		});
		return this.signal;
	}

	stop() {
		this.signal.close();
	}

}

let from = {
	type: 'system',
	config: {
		root: __dirname,
		filter: f => {
			return !/{node_modules, dist}/.test(f)
		}
	}
};

let to = {
	type: 'system',
	config: {
		root: path.join(__dirname, 'dist')
	}
};

let s = new ParallelSpace(from, to);
let signals = s.run();

// capture watcher events
// signals.on('change', (e, file) => {
// 	console.log(e, file);
// });
// 
// console.log(s)
