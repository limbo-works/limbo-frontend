import path from 'path';

import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import babel from '@rollup/plugin-babel';
import filesize from 'rollup-plugin-filesize';

const { dependencies = {} } = require(path.join(process.cwd(), 'package.json'));

const plugins = {
	default: [
		alias({
			entries: {
				'@': path.resolve(process.cwd(), 'src'),
			},
		}),

		replace({
			'process.env.NODE_ENV': JSON.stringify('production'),
		}),

		commonjs(),
	],

	babel: {
		exclude: 'node_modules/**',
		babelHelpers: 'runtime',
	},
};

const config = {
	input: 'src/index.js',
	external: Object.keys(dependencies),

	output: {
		sourcemap: true,
	},
};

export default [
	{
		...config,

		output: {
			...config.output,

			file: 'dist/index.es.mjs',
			format: 'esm',
		},

		plugins: [
			resolve({
				browser: true,
			}),

			...plugins.default,

			babel({
				...plugins.babel,

				presets: [
					[
						'@babel/preset-env',
						{
							targets: [
								'node >= 10',
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

			compact: true,
			file: 'dist/index.cjs.js',
			format: 'cjs',
			exports: 'named',
		},

		plugins: [
			resolve(),

			...plugins.default,

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
