module.exports = function (plop) {
	/**
	 * New .npmrc file
	 */
	plop.setGenerator('npmrc', {
		description: 'Generates a new .npmrc file.',
		prompts: [
			{
				type: 'input',
				name: 'token',
				message: 'Provide your GitHub PAT (Personal Access Token).',
			},
		],
		actions() {
			return [
				{
					type: 'add',
					path: './.npmrc',
					templateFile: './templates/npmrc/npmrc.hbs',
				},
			];
		},
	});

	/**
	 * New package
	 */
	plop.setGenerator('package', {
		description: 'Generates a package.',
		prompts: [
			{
				type: 'list',
				name: 'type',
				message: 'Select vue or js package.',
				choices: ['vue', 'js'],
			},
			{
				type: 'input',
				name: 'name',
				message: 'Name your package.',
			},
			{
				type: 'input',
				name: 'description',
				message: 'Describe your package.',
			},
		],

		actions(data) {
			/**
			 * Root
			 */
			const root = [
				{
					type: 'add',
					path: './packages/{{dashCase name}}/package.json',
					templateFile: './templates/package/package-{{type}}.hbs',
				},
				{
					type: 'add',
					path: './packages/{{dashCase name}}/README.md',
					templateFile: './templates/package/readme-{{type}}.hbs',
				},

				...(data.type === 'vue'
					? [
							{
								type: 'add',
								path:
									'./packages/{{dashCase name}}/babel.config.js',
								templateFile:
									'./templates/package/babel.config.hbs',
							},
					  ]
					: []),
			];

			/**
			 * Src
			 */
			const srcPath = data.type === 'vue' ? '/src' : '';
			const srcName = data.type === 'vue' ? '{{dashCase name}}' : 'index';

			const src = [
				...(data.type === 'vue'
					? [
							{
								type: 'add',
								path: `./packages/{{dashCase name}}${srcPath}/entry.js`,
								templateFile:
									'./templates/package/src/entry.hbs',
							},
					  ]
					: []),

				{
					type: 'add',
					path: `./packages/{{dashCase name}}${srcPath}/${srcName}.{{type}}`,
					templateFile: './templates/package/src/_{{type}}.hbs',
				},
			];

			/**
			 * Dev
			 */
			const dev = [
				{
					type: 'add',
					path: './packages/{{dashCase name}}/dev/entry.js',
					templateFile:
						'./templates/package/dev/serve-{{type}}-entry.hbs',
				},
				{
					type: 'add',
					path: './packages/{{dashCase name}}/dev/serve.{{type}}',
					templateFile: './templates/package/dev/serve-{{type}}.hbs',
				},
			];

			/**
			 * Test
			 */
			const test = [
				{
					type: 'add',
					path: './packages/{{dashCase name}}/test/.eslintrc.js',
					templateFile: './templates/package/test/eslintrc.hbs',
				},
				{
					type: 'add',
					path:
						'./packages/{{dashCase name}}/test/{{properCase name}}.spec.js',
					templateFile: './templates/package/test/spec.hbs',
				},
			];

			/**
			 * Returns
			 */
			return [
				...root,
				...src,
				...dev,

				...(data.type === 'vue' ? test : []),
			];
		},
	});
};
