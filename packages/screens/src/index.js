export default (values, rootFontSize = 16) =>
	values.reduce(({ screens = {}, breakpoints = {} }, value) => {
		const { value: px, min: hasMin = true, max: hasMax = false } =
			typeof value === 'number' ? { value } : value ?? {};

		if (!px) {
			throw new Error(`\`value\` required: ${value}`);
		}

		const em = px / rootFontSize;
		const min = `${em}em`;
		const max = `${em - 0.01}em`;

		return {
			screens: {
				...screens,

				...(hasMin ? { [`>=${px}`]: min } : {}),

				...(hasMax ? { [`<${px}`]: { max } } : {}),
			},

			breakpoints: {
				...breakpoints,

				[`${px}`]: { px, em, min, max },
			},
		};
	}, {});
