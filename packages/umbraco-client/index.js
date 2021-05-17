import path from 'path';

import consola from 'consola';

import packageJson from './package.json';

const { name } = packageJson;

const PROXY_ENDPOINTS = [
	'/umbraco',
	'/api',
	'/media',
	'/formrender',
	'/remote.axd',
];

export default function UmbracoClientModule(moduleOptions) {
	const { nuxt } = this;
	const { logLevel } = {
		logLevel: 3,

		...nuxt.options.umbracoClient,
		...moduleOptions,
	};
	const logger = consola.withScope(`nuxt:${name}`);

	logger.level = logLevel;

	logger.debug('Adding plugin');

	this.addPlugin({
		src: path.resolve(__dirname, 'templates/plugin.js'),
		fileName: 'umbraco-client/plugin.js',
		options: {
			name,
		},
	});

	const {
		options: { build },
	} = nuxt;

	logger.debug('Adding `options.build.transpile` entry');

	if (Array.isArray(build.transpile)) {
		build.transpile.push(name);
	} else {
		build.transpile = [name, build.transpile].filter(Boolean);
	}

	const { API_DOMAIN } = nuxt.options.publicRuntimeConfig;

	logger.debug(`Configuring proxy using '${API_DOMAIN}'`);

	nuxt.options.proxy = {
		...PROXY_ENDPOINTS.reduce(
			(acc, endpoint) => ({
				...acc,

				[endpoint]: API_DOMAIN,
			}),
			{}
		),

		...(nuxt.options.proxy ? nuxt.options.proxy : {}),
	};

	logger.debug('Proxy configured', nuxt.options.proxy);
}

module.exports.meta = packageJson;
