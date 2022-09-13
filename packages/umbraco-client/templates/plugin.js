import { configure } from '<%= options.name %>/client.js';

const getHostnameAndOrigin = (req, { API_DOMAIN, APP_HOST }) => {
	if (process.client) {
		const { hostname, origin } = new URL(window.location.href);

		return { hostname: APP_HOST ?? hostname, origin };
	}

	if (!APP_HOST) {
		// Default to the request host
		APP_HOST = req.headers.host;

		if (process.env.NODE_ENV === 'development') {
			console.warn(
				`Missing $config variable: { 'APP_HOST': ${APP_HOST} }`
			);
		}
	}

	if (API_DOMAIN && APP_HOST) {
		return { origin: API_DOMAIN, hostname: APP_HOST };
	}

	if (process.env.NODE_ENV === 'development') {
		if (!API_DOMAIN) {
			throw new Error(
				`Missing $config variable: { 'API_DOMAIN': ${API_DOMAIN} }`
			);
		}

		return;
	}

	// NOTE: in this setup (using `nuxt-start`) `req` is an instance of `http.IncomingMessage`
	// https://nodejs.org/docs/latest-v10.x/api/http.html#http_class_http_incomingmessage
	const {
		headers: { host },
		socket: { encrypted },
	} = req;
	const { hostname } = new URL(`http://${host}`);
	const protocol = encrypted ? 'https' : 'http';
	const origin = `${protocol}://${host}`;

	return { hostname, origin };
};

export default ({ $axios, $config, req }, inject) => {
	const { origin: baseURL, hostname } = getHostnameAndOrigin(req, $config);
	const httpClient = $axios.create({ baseURL });

	inject('baseURL', baseURL);

	configure({ hostname, httpClient });
};
