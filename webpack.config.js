'use strict';

var  babelQuery ={
	presets: ['es2015'],
	plugins: ['transform-es3-property-literals','transform-es3-member-expression-literals']
}


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
				test: /\.js$/,
				exclude: /node_modules/,
				loaders: ['es3ify-loader',`babel?${JSON.stringify(babelQuery)}`]
			}
        ]
    }
};
