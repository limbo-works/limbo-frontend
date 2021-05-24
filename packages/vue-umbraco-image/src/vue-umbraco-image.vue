<template>
	<picture
		class="c-umbraco-image"
		:class="{ 'c-umbraco-image--lazyload': $attrs.lazyload }"
	>
		<source
			v-for="{ format, ...source } in sources"
			:key="format"
			:sizes="$attrs.sizes"
			v-bind="source"
		/>

		<ResponsiveImage
			v-bind="{ ...$attrs, src, srcset: defaultSrcset }"
			class="c-umbraco-image__image"
			:class="imageClassNames"
		/>
	</picture>
</template>

<script>
import ResponsiveImage from '@limbo-works/vue-responsive-image';

import { getUmbracoImageUrl } from './utilities';
import mixin from './mixin';

export default {
	components: {
		ResponsiveImage,
	},

	mixins: [mixin],

	inheritAttrs: false,

	props: {
		sourceUrl: {
			type: String,

			required: true,
		},
	},

	methods: {
		imageUrl(width, height) {
			return getUmbracoImageUrl(
				this.sourceUrl,
				width,
				height,
				this.transformations
			);
		},
	},
};
</script>
