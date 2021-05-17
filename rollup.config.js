import path from 'path';

import vue from 'rollup-plugin-vue';
import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import babel from '@rollup/plugin-babel';
import postCssPresetEnv from 'postcss-preset-env';
import filesize from 'rollup-plugin-filesize';
import upperCamelCase from 'uppercamelcase';

const { name: packageName, dependencies } = require(path.join(
	process.cwd(),
	'package.json'
));

const [filename, name] = (() => {
	const parts = packageName.split('/');
	const kebabCaseName = parts[parts.length - 1];
	const pascaleCaseName = upperCamelCase(kebabCaseName);

	return [kebabCaseName, pascaleCaseName];
})();

const plugins = {
	preVue: [
		alias({
			resolve: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
			entries: {
				'@': path.resolve(process.cwd(), 'src'),
			},
		}),

		replace({
			'process.env.NODE_ENV': JSON.stringify('production'),
		}),

		commonjs(),
	],

	vue: {
		css: true,

		template: {
			isProduction: true,
		},

		style: {
			postcssPlugins: [
				postCssPresetEnv({
					stage: false,

					features: {
						'nesting-rules': true,
						'custom-properties': {
							preserve: false,
						},
						'focus-visible-pseudo-class': true,
					},
				}),
			],
		},
	},

	babel: {
		exclude: 'node_modules/**',
		extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
		babelHelpers: 'runtime',
	},
};

const config = {
	input: 'src/entry.js',
	external: ['vue', ...Object.keys(dependencies)],
};

export default [
	{
		...config,

		output: {
			...config.output,
			file: `dist/${filename}.modern.js`,
			format: 'esm',
		},

		plugins: [
			resolve({
				browser: true,
			}),

			...plugins.preVue,

			vue(plugins.vue),

			babel({
				...plugins.babel,

				presets: [
					[
						'@babel/preset-env',
						{
							targets: [
								'last 2 chrome version',
								'last 2 firefox versions',
								'last 2 safari versions',
								'last 2 edge versions',
							].join(', '),
						},
					],
				],
			}),

			filesize(),
		],
	},

	{
		...config,

		output: {
			...config.output,
			file: `dist/${filename}.legacy.js`,
			format: 'esm',
		},

		plugins: [
			resolve({
				browser: true,
			}),

			...plugins.preVue,

			vue({
				...plugins.vue,

				normalizer: '~vue-runtime-helpers/dist/normalize-component.js',
				styleInjector:
					'~vue-runtime-helpers/dist/inject-style/browser.js',
			}),

			babel({
				...plugins.babel,

				presets: [
					[
						'@babel/preset-env',
						{
							targets: 'defaults',
						},
					],
				],
			}),

			filesize(),
		],
	},

	{
		...config,

		output: {
			...config.output,
			compact: true,
			file: `dist/${filename}.ssr.js`,
			format: 'cjs',
			name,
			exports: 'named',
		},

		plugins: [
			resolve(),

			...plugins.preVue,

			vue({
				...plugins.vue,

				template: {
					...plugins.vue.template,

					optimizeSSR: true,
				},
			}),

			babel({
				...plugins.babel,

				presets: [
					[
						'@babel/preset-env',
						{
							targets: 'node >= 10',
						},
					],
				],
			}),

			filesize(),
		],
	},
];
