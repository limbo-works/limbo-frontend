// NOTE: in order to use the URL API we need to provide a base
const DEFAULT_BASE_URL = 'https://example.com';

export const FORMATS = {
	webp: 'image/webp',
};

export const getUmbracoImageUrl = (
	sourceUrl,
	width,
	height,
	transformations = {}
) =>
	getImageUrl(sourceUrl, {
		width,
		height,
		mode: 'crop',
		autorotate: true,
		...transformations,
	});

export const getImageUrl = (sourceUrl, transformations) => {
	const url = new URL(sourceUrl, DEFAULT_BASE_URL);

	Object.entries(transformations).forEach(([name, value]) =>
		url.searchParams.set(name, value)
	);

	return `${url.pathname}?${url.searchParams.toString()}`;
};

export const imageSizes = (
	{ default: defaultSize, ...sizesByBreakpoint },
	breakpoints = {}
) => {
	const breakpointNames = Object.keys(breakpoints);

	return Object.entries(sizesByBreakpoint)
		.filter(([breakpointName]) => breakpointNames.includes(breakpointName))
		.reduce(
			(sizes, [breakpointName, size]) => [
				`(min-width: ${breakpoints[breakpointName].em}em) ${size}`,
				...sizes,
			],
			[defaultSize].filter(Boolean)
		)
		.join(', ');
};
