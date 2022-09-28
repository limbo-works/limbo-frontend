import { configure } from '<%= options.name %>/client.js';

const getHostAndOrigin = (req, { API_DOMAIN, APP_HOST }) => {
	if (process.client) {
		const { host, origin } = new URL(window.location.href);

		return { host: APP_HOST ?? host, origin };
	}

	if (!APP_HOST) {
		// Default to the request host, if no APP_HOST is set through config
		APP_HOST = req.headers.host;

		if (process.env.NODE_ENV === 'development') {
			console.warn("Missing $config variable 'APP_HOST'");
		}
	}

	if (API_DOMAIN && APP_HOST) {
		return { origin: API_DOMAIN, host: APP_HOST };
	}

	if (process.env.NODE_ENV === 'development') {
		if (!API_DOMAIN) {
			throw new Error("Missing $config variable 'API_DOMAIN'");
		}

		return;
	}

	// NOTE: in this setup (using `nuxt-start`) `req` is an instance of `http.IncomingMessage`
	// https://nodejs.org/docs/latest-v10.x/api/http.html#http_class_http_incomingmessage
	const {
		headers: { host },
		socket: { encrypted },
	} = req;
	const protocol = encrypted ? 'https' : 'http';
	const origin = `${protocol}://${host}`;

	return { host, origin };
};

export default ({ $axios, $config, req }, inject) => {
	const { origin: baseURL, host } = getHostAndOrigin(req, $config);
	const httpClient = $axios.create({ baseURL });

	inject('baseURL', baseURL);

	configure({ host, httpClient });
};
