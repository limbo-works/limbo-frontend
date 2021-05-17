module.exports = {
	root: true,

	parserOptions: {
		parser: 'babel-eslint',
		sourceType: 'module',
	},

	env: {
		es6: true,
		node: true,
		browser: true,
	},

	extends: [
		'eslint:recommended',
		'standard',
		'plugin:vue/recommended',
		'plugin:prettier/recommended',
		'prettier',
	],

	rules: {
		'brace-style': 'error',
		curly: ['error', 'all'],
		'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
		'no-prototype-builtins': 'off',

		'import/order': [
			'error',
			{
				'newlines-between': 'always',
			},
		],

		'vue/no-v-html': 'off',
		'vue/require-default-prop': 'off',

		'vue/component-name-in-template-casing': [
			'error',
			'PascalCase',
			{
				registeredComponentsOnly: false,
			},
		],

		'vue/attribute-hyphenation': [
			'error',
			'always',
			{
				ignore: ['preserveAspectRatio'],
			},
		],
	},
};
