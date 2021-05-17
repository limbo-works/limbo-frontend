# Umbraco Client

> A tool for fetching data from a Limbo Umbraco SPA Endpoint

Add the following to the `.npmrc` in the root of the project _before_ running
the install command:-

```npmrc
@limbo-works:registry=https://npm.pkg.github.com
```

Install the module:-

```shell
$ yarn add @limbo-works/umbraco-client
```

Install the Axios module (if not already installed):-

```shell
$ yarn add @nuxtjs/axios
```

Configure `nuxt.config.js`:-

```js
export default {
	// Umbraco Client module must come *before* Axios
	modules: ['@limbo-works/umbraco-client', '@nuxtjs/axios'],

	// transpile modules imported to client and server code
	build: {
		transpile: ['@limbo-works/umbraco-client'],
	},

	// ensure `API_DOMAIN` and `APP_HOST` are set in `.env` in the root of the project
	publicRuntimeConfig: {
		API_DOMAIN: process.env.API_DOMAIN,
		APP_HOST: process.env.APP_HOST,
	},
};
```
