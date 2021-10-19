<script>
// deepmerge is from Nuxt setup
import deepmerge from 'deepmerge';

const isInternal = (href, target) =>
	/^\/(?!\/)/.exec(href) !== null && target !== '_blank';

const targetString = (href, target) => {
	if (!isInternal(href, target)) {
		return '_blank';
	}

	return target || '';
};

const tag = (href, target, disabled, fallback) => {
	if (!href || disabled) {
		return fallback;
	}

	const isMedia = href.indexOf('/media/') === 0;

	if (!isInternal(href, target) || isMedia) {
		return 'a';
	}

	return 'nuxt-link';
};

export default {
	name: 'SpaLink',
	functional: true,
	props: {
		href: String,
		fallback: {
			type: String,
			default: 'span',
		},
		disabled: Boolean,
		target: String,
		title: String,
	},
	render(createElement, ctx) {
		const { props, data, children } = ctx;
		const tagType = tag(
			props.href,
			props.target,
			props.disabled,
			props.fallback
		);
		let dataConfig = null;

		if (tagType === 'nuxt-link') {
			dataConfig = deepmerge(data, {
				staticClass: data.staticClass
					? `spa-link ${data.staticClass}`
					: 'spa-link',
				attrs: (props.title && { title: props.title }) || {},
				props: {
					to: props.href,
				},
			});
		} else if (tagType === 'a') {
			const _targetString = targetString(props.href, props.target);

			dataConfig = deepmerge(data, {
				staticClass: data.staticClass
					? `spa-link ${data.staticClass}`
					: 'spa-link',
				attrs: {
					href: props.href,
					target: _targetString,
					rel:
						_targetString === '_blank' ? 'noopener noreferrer' : '',
				},
			});

			// Avoid v-on.native error
			if (data.nativeOn) {
				dataConfig.on = dataConfig.on
					? Object.assign(dataConfig.on, data.nativeOn)
					: data.nativeOn;

				delete dataConfig.nativeOn;
			}
		} else {
			dataConfig = Object.assign({}, data, {
				staticClass: data.staticClass
					? `spa-link ${data.staticClass}`
					: 'spa-link',
			});
		}

		return createElement(tagType, dataConfig, children);
	},
};
</script>
