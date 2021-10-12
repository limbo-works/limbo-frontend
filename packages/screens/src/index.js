const getMin = (em) => `${em}em`;
const getMax = (em) => `${em - 0.01}em`;

export default (values, rootFontSize = 16) =>
	values.reduce(({ screens = {}, breakpoints = {} }, value) => {
		const { value: pxValue, min = true, max = false } =
			typeof value === 'number' ? { value } : value ?? {};

		if (!pxValue) {
			throw new Error(`\`value\` required: ${value}`);
		}

		const emValue = pxValue / rootFontSize;

		return {
			screens: {
				...screens,

				...(min
					? {
							[`>=${pxValue}`]: getMin(emValue),
					  }
					: {}),

				...(max
					? {
							[`<${pxValue}`]: { max: getMax(emValue) },
					  }
					: {}),
			},

			breakpoints: {
				...breakpoints,

				[`${pxValue}`]: {
					px: pxValue,
					em: emValue,
					min: getMin(emValue),
					max: getMax(emValue),
				},
			},
		};
	}, {});
