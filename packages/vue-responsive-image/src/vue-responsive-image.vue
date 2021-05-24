<template>
	<img
		class="v-responsive-image"
		:class="{ lazyload: isSSR ? lazyload && !fallback : useLazysizes }"
		v-bind="{ ...$attrs, ...attributes }"
	/>
</template>

<script>
import { ValidationError } from './errors';

const TRANSPARENT_GIF =
	'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

export default {
	name: 'VueResponsiveImage',

	inheritAttrs: false,

	props: {
		src: {
			type: String,

			required: true,
		},

		srcset: {
			type: String,
		},

		sizes: {
			type: String,
		},

		lazyload: {
			type: Boolean,

			default: false,
		},

		placeholder: {
			type: String,

			default: TRANSPARENT_GIF,
		},

		fallback: {
			type: Boolean,

			default: false,
		},
	},

	data() {
		return {
			isSSR: true,
			supportsLoadingAttribute: false,
		};
	},

	computed: {
		useLazysizes() {
			if (!this.lazyload) {
				return false;
			}

			if (!this.fallback) {
				return true;
			}

			return !this.supportsLoadingAttribute;
		},

		attributes() {
			if (this.lazyload) {
				if (this.isSSR || this.useLazysizes) {
					return {
						src: this.placeholder,
						'data-src': this.src,
						'data-srcset': this.srcset,
						'data-sizes': this.sizes,
					};
				}

				return {
					src: this.src,
					srcset: this.srcset,
					sizes: this.sizes,
					loading: 'lazy',
				};
			}

			return {
				src: this.src,
				srcset: this.srcset,
				sizes: this.sizes,
			};
		},
	},

	created() {
		if (this.sizes === 'auto' && (this.fallback || !this.lazyload)) {
			throw new ValidationError(
				'`sizes` can only be set to `"auto"` if `lazyload` is `true` and `fallback` is `false`.'
			);
		}

		if (this.srcset && typeof this.sizes === 'undefined') {
			throw new ValidationError(
				'`sizes` must be set when `srcset` present.'
			);
		}
	},

	mounted() {
		this.isSSR = false;

		this.supportsLoadingAttribute = 'loading' in HTMLImageElement.prototype;
	},
};
</script>

<style>
.no-js .v-responsive-image[data-src],
.no-js .v-responsive-image[data-srcset] {
	display: none;
}
</style>
