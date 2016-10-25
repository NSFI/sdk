module.exports =  {
	entry: "./src/index.js",
	output: {
		path: "./docs",
		filename: "sdk.js",
		library : 'sfSDK'
	},
	//devtool: "source-map",
	resolve:{
		extensions: ['', '.js', '.vue']
	},
	module: {
		loaders: [
			{test: /\.html/, exclude : /node_modules/, loader: 'html'},
			{test: /\.scss$/, exclude : /node_modules/, loader: "style!css!sass" }
		]
	}
};
