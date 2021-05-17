const UMBRACO_GET_DATA_ENDPOINT = '/umbraco/api/spa/getdata';
const REDIRECT_STATUS_CODES = [301, 302, 307, 308];
const BAD_REQUEST_STATUS_CODE = 400;
const NOT_FOUND_STATUS_CODE = 404;
const I_AM_A_TEAPOT_STATUS_CODE = 418;
const INTERNAL_SERVER_ERROR_STATUS_CODE = 500;

const parts = ['content', 'navigation', process.server && 'site']
	.filter(Boolean)
	.join(',');

let hostname;
let httpClient;

export const configure = (options) => ({ hostname, httpClient } = options);

export const fetchUmbracoData = (route, params = {}) => {
	const urlSearchParams = new URLSearchParams({
		appHost: hostname,
		navContext: process.server,
		navLevels: 2,
		parts,
		url: route.path,

		...params,
	});

	return httpClient.get(
		`${UMBRACO_GET_DATA_ENDPOINT}?${urlSearchParams.toString()}`
	);
};

export const handleError = (error, { nuxtError, query = {}, redirect }) => {
	const statusCode = parseInt(error.response?.status, 10);

	if (
		!error.response ||
		Number.isNaN(statusCode) ||
		statusCode === BAD_REQUEST_STATUS_CODE
	) {
		if (process.server) {
			console.error(error);
		}

		nuxtError({
			statusCode: statusCode || BAD_REQUEST_STATUS_CODE,
			message: error.message || 'Unknown Error',
		});

		return;
	}

	if (statusCode === NOT_FOUND_STATUS_CODE) {
		nuxtError({
			statusCode,
			message: 'Not Found',
		});

		return error.response?.data;
	}

	if (
		statusCode === I_AM_A_TEAPOT_STATUS_CODE ||
		REDIRECT_STATUS_CODES.includes(statusCode)
	) {
		const {
			data: {
				meta = {},
				data: { url: redirectUrl },
			},
		} = error.response;

		// NOTE: preserving `route.query` state e.g. `?utm=...`
		const url = [redirectUrl, new URLSearchParams(query).toString()]
			.filter(Boolean)
			.join('?');

		redirect(meta.code ?? statusCode, url);

		return false;
	}

	if (statusCode === INTERNAL_SERVER_ERROR_STATUS_CODE) {
		const {
			status: statusCode,
			statusText: message,
			config: { baseURL, url, method, headers },
		} = error.response;
		const errorMessage = `${statusCode} ${message}`;
		const errorInfo = { baseURL, url, method, headers };

		if (process.server) {
			console.error(errorMessage, errorInfo);
		}

		nuxtError({
			statusCode: statusCode || INTERNAL_SERVER_ERROR_STATUS_CODE,
			message: message || 'Internal Server Error',
		});
	}
};

export default async ({ error: nuxtError, params = {}, redirect, route }) => {
	try {
		const { data } = await fetchUmbracoData(route, params);

		return data;
	} catch (error) {
		return handleError(error, { nuxtError, query: route.query, redirect });
	}
};
