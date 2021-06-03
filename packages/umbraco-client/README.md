# Umbraco Client

> A tool for fetching data from a Limbo Umbraco SPA Endpoint

This is an evolution of the `getData` and `entry` Nuxt plugins. It solves the
issue with redirects and errors on both the client and server.

## Installation

Before installing the package, it's necessary to configure NPM with a GitHub
[Personal Access Token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token)
(PAT) with the `read:packages` scope.

Using your PAT, configure the `.npmrc` in the root of the project like so
_before_ running the install command:-

```npmrc
//npm.pkg.github.com/:_authToken=${PAT}
@limbo-works:registry=https://npm.pkg.github.com
```

Install the Nuxt Umbraco Client module:-

```shell
$ yarn add @limbo-works/umbraco-client
```

Install the Nuxt Axios module (if not already installed):-

```shell
$ yarn add @nuxtjs/axios
```

Configure `nuxt.config.js`:-

```js
export default {
	// Umbraco Client module must come *before* Axios
	modules: ['@limbo-works/umbraco-client', '@nuxtjs/axios'],

	// set `API_DOMAIN` and `APP_HOST` in `.env` (in the root of the project)
	publicRuntimeConfig: {
		API_DOMAIN: process.env.API_DOMAIN,
		APP_HOST: process.env.APP_HOST,
	},
};
```

## Usage

### Router Middleware (CSR)

To ensure that data fetching happens on _every_ route change we define a router
middleware that fetches data from the Umbraco API and populates the store as
usual:-

```js
// ~/frontend/middleware/umbraco-client.js

import fetchUmbracoData from '@limbo-works/umbraco-client/client';

export default async ({
	error,
	redirect,
	route,
	store: { commit, dispatch },
}) => {
	if (process.server) {
		return;
	}

	dispatch('Transition/INIT');

	const data = await fetchUmbracoData({ error, redirect, route });

	// NOTE: this is the case on redirect
	if (data === false) {
		return;
	}

	if (data) {
		dispatch('SAVE_DATA', data);

		return;
	}

	// NOTE: if we've reached this point then it's an *endpoint* 404
	// rather than a content 404 (something is wrong with the API)
	commit('_CLEAR_CURRENT_DATA');
};
```

```js
// ~/frontend/store/index.js

export const mutations = {
	_CLEAR_CURRENT_DATA(state) {
		state.current = {
			page: {},
			doctype: null,
			guid: null,
		};
	},
};
```

```js
// ~/nuxt.config.js

export default {
	router: {
		middleware: ['umbraco-client'],
	},
};
```

### `nuxtServerInit` Action (SSR)

```js
// ~/frontend/store/index.js

export const actions = {
	async nuxtServerInit({ dispatch }, { error, redirect, route }) {
		const data = await fetchUmbracoData({ error, redirect, route });

		if (!data) {
			return;
		}

		dispatch('SAVE_DATA', data);
	},
};
```

## Errors

On receiving an erroneous response from the server (status code `404`, `500`,
etc.) the Umbraco Client calls the `error` method from the Nuxt context. This
renders the
[Nuxt error page](https://nuxtjs.org/docs/2.x/concepts/views#error-page), and so
we must configure it on each project.

The `~/frontend/layouts/error.vue` page behaves similarly to the
`~/frontend/pages/index.vue` page and we should configure it as such. Here is an
example of an error page from a municipality project which should provide a good
starting point for other error pages:-

```vue
<template>
	<main class="p-error">
		<component
			:is="errorPage"
			v-if="isContent404"
			@hook:mounted="handleErrorPageComponentMounted"
		/>

		<div v-else>
			<h1 v-text="error.message"></h1>

			<a href="/">Tilbage til forside</a>
		</div>
	</main>
</template>

<script>
import { mapGetters } from 'vuex';

const errorPagesBySolution = {
	main: () =>
		import(
			/* webpackChunkname: "main__errorPage" */
			'~/doctypes/main/ErrorPage'
		),

	subsite: () =>
		import(
			/* webpackChunkname: "subsite__errorPage" */
			'~/doctypes/subsite/ErrorPage'
		),
};

export default {
	key(route) {
		return route.fullPath;
	},

	props: {
		error: {
			type: Object,

			default: () => ({
				statusCode: 500,
				message: 'Internal Server Error',
			}),
		},
	},

	layout({ store }) {
		const { solution, current, mappings } = store.state;
		const requestedLayout = mappings.layouts[solution]?.[current.doctype];

		return requestedLayout ?? `${solution}/Default`;
	},

	computed: {
		...mapGetters(['doctype', 'solution']),

		isContent404() {
			return (
				this.error.statusCode === 404 && this.doctype === 'ErrorPage'
			);
		},

		errorPage() {
			return errorPagesBySolution[this.solution];
		},
	},

	mounted() {
		if (this.isContent404) {
			return;
		}

		this.$store.dispatch('Transition/END');
	},

	methods: {
		handleErrorPageComponentMounted() {
			this.$store.dispatch('Transition/END');
		},
	},
};
</script>
```

The error page outlined above requires a dedicated doctype called `ErrorPage`
and I think this is a good pattern to establish across all projects. This
doctype should exist in Umbraco _and_ Nuxt, for consistency's sake (rather than
reusing the `Subpage` doctype, though they will—more often than not—be similar).
