module.exports =  {
    entry: {
		sdk : './src/AppSDK.js',
		delegate : './src/TraderSDK.js'
	},
    output: {
        path: "./dist",
        filename: "[name].js",
		library : 'SFSDK'
    },
    module: {
        loaders: [
			{
				test: /\.js/,
				exclude: /node_modules/,
				loader: 'babel',
				query: {
					presets: ['es2015-loose', 'stage-0'],
					plugins: ['transform-runtime']
				}
			}
        ]
    }
};
