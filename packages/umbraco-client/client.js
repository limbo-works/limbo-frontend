const UMBRACO_GET_DATA_ENDPOINT = '/umbraco/api/spa/getdata';
const REDIRECT_STATUS_CODES = [301, 302, 307, 308];
const BAD_REQUEST_STATUS_CODE = 400;
const NOT_FOUND_STATUS_CODE = 404;
const I_AM_A_TEAPOT_STATUS_CODE = 418;
const INTERNAL_SERVER_ERROR_STATUS_CODE = 500;

const parts = ['content', 'navigation', process.server && 'site']
	.filter(Boolean)
	.join(',');

let host;
let httpClient;

export const configure = (options) => ({ host, httpClient } = options);

export const fetchUmbracoData = (
	route,
	params = {},
	endpointUrl = UMBRACO_GET_DATA_ENDPOINT,
	debug = false
) => {
	const urlSearchParams = new URLSearchParams({
		appHost: host,
		navContext: process.server,
		navLevels: 2,
		parts,
		url: route.path,

		...params,
	});
	urlSearchParams.delete('headers');
	if (debug) {
		const debugParams = { ...params };
		delete debugParams.headers;

		console.group(
			'Fetching data from ' +
				`${endpointUrl}?${urlSearchParams.toString()}`
		);
		console.log('params:', debugParams);
		console.log('headers:', params?.headers);
		console.groupEnd();
	}

	return httpClient.get(`${endpointUrl}?${urlSearchParams.toString()}`, {
		headers: params?.headers || {},
	});
};

export const handleError = (error, { nuxtError, query = {}, redirect }) => {
	const statusCode = parseInt(
		error.response?.data?.meta?.code ?? error.response?.status,
		10
	);
	const statusMessage =
		error.response?.data?.meta?.error ?? error?.message ?? '';

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
			message: statusMessage || 'Unknown Error',
		});

		return;
	}

	if (statusCode === NOT_FOUND_STATUS_CODE) {
		nuxtError({
			statusCode,
			message: statusMessage || 'Not Found',
		});

		return error.response?.data;
	}

	if (
		statusCode === I_AM_A_TEAPOT_STATUS_CODE ||
		REDIRECT_STATUS_CODES.includes(statusCode)
	) {
		const {
			data: {
				data: { url: redirectUrl },
			},
		} = error.response;

		// NOTE: preserving `route.query` state e.g. `?utm=...`
		const url = [redirectUrl, new URLSearchParams(query).toString()]
			.filter(Boolean)
			.join('?');

		redirect(statusCode, url);

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

export default async ({
	endpointUrl = UMBRACO_GET_DATA_ENDPOINT,
	onResponse,
	error: nuxtError,
	params = {},
	redirect,
	route,
	debug = false,
}) => {
	try {
		const response = await fetchUmbracoData(
			route,
			params,
			endpointUrl,
			debug
		).then((response) => {
			return onResponse ? onResponse(response) : response;
		});
		const { data } = response;

		// To allow for API-appropriate response handling (meta)
		const statusCode = data.meta?.code ?? 200;
		if (statusCode !== 200) {
			return handleError(
				{ response },
				{ nuxtError, query: route.query, redirect }
			);
		}

		return data;
	} catch (error) {
		return handleError(error, { nuxtError, query: route.query, redirect });
	}
};
