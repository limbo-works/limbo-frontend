module.exports = {
	extends: ['stylelint-config-standard', 'stylelint-config-rational-order'],

	plugins: [
		'stylelint-order',
		'stylelint-config-rational-order/plugin',
		'stylelint-no-unsupported-browser-features',
		'stylelint-prettier',
	],

	rules: {
		'prettier/prettier': true,

		// NOTE: these rules clash with Prettier
		'declaration-colon-newline-after': null,
		'value-list-comma-newline-after': null,

		indentation: 'tab',

		'at-rule-no-unknown': [
			true,
			{
				ignoreAtRules: ['nest'],
			},
		],
		'comment-empty-line-before': null,

		'plugin/no-unsupported-browser-features': [
			true,
			{
				severity: 'warning',
			},
		],
	},
};
