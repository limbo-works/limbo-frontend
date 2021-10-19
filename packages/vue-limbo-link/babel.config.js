module.exports = {
	env: {
		development: {
			presets: ['@vue/babel-preset-app'],
		},

		production: {
			presets: ['@babel/preset-env'],
			plugins: ['@babel/plugin-transform-runtime'],
		},
	},
};
