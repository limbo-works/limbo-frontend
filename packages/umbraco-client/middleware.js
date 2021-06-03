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
