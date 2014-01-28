//Alternative way to access mean from child
//We dont actually have to pass mean object along
//var mean = module.parent.exports.mean;

module.exports = function(mean) {

	// Middleware for adding chained function before or after routes
	require('./chainware')(mean);

	// We have events such as ready for modules to use
	require('./events')(mean);

	//catch when module is ready
	mean.events.on('ready', ready);

	//read the file structure
	var fs = require('fs');
	fs.readdir(process.cwd() + '/modules', function(err, files) {
		if (err) console.log(err);
		remaining = files.length;
		files.forEach(function(file) {
			fs.readFile(process.cwd() + '/modules/' + file + '/package.json', function(fileErr, data) {
				if (err) throw fileErr;
				if (data) {
					var json = JSON.parse(data.toString());
					require(process.cwd() + '/modules/' + file + '/app.js')(mean);
				} else {
					remaining--;
				}
			});
		});
	});

	// Process the ready event. Will expand this in due course
	ready: function ready(data) {
		remaining--;
		if (!remaining) resolve();
	}

	// Resolve the dependencies once all modules are ready
	resolve: function resolve() {
		mean.modules.forEach(function(module) {
			mean.resolve.apply(this, [module.name]);
			mean.get(module.name);
		});
	}

}