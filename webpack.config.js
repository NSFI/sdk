module.exports =  {
    entry: {
		AppSdk : './src/AppSDK.js',
		TraderSdk: './src/TraderSDK.js'
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
					plugins: ['transform-runtime', 'transform-es3-property-literals','transform-es3-member-expression-literals']
				}
			}
        ]
    }
};
