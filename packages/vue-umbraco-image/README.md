# Vue Umbraco Image

> A light-weight Vue component and accompanying utilities for rendering images
> from Umbraco.

[Lazysizes](https://github.com/aFarkas/lazysizes) provides lazyloading,
polyfilling, and other such functionality.

## Installation

```shell
> yarn add @limbo-works/vue-umbraco-image @saulhardman/nuxt-lazysizes
```

```js
// nuxt.config.js
export default {
	buildModules: ['@saulhardman/nuxt-lazysizes'],

	lazySizes: {
		config: {
			init: false,
			loadingClass: 'is-lazyloading',
			loadedClass: 'is-lazyloaded',
		},

		plugins: ['parent-fit'],
	},
};
```

## Usage

```vue
<template>
	<div>
		<!-- natural aspect ratio -->
		<UmbracoImage
			:widths="[320, 375, 640, 750, 1024]"
			:source-url="image.croppedUrl || image.url"
			:source-width="image.width"
			:source-height="image.height"
			sizes="100vw"
			:alt="image.altText"
		/>

		<!-- fixed aspect ratio -->
		<UmbracoImage
			:widths="[320, 375, 640, 750, 1024]"
			:source-url="image.croppedUrl || image.url"
			:source-width="image.width"
			:source-height="image.height"
			:aspect-ratio="16 / 9"
			sizes="100vw"
			:alt="image.altText"
		/>

		<!-- lazyloaded (with `imageSizes` utility) -->
		<UmbracoImage
			:widths="[320, 375, 640, 750, 1024]"
			:source-url="image.croppedUrl || image.url"
			:source-width="image.width"
			:source-height="image.height"
			:sizes="
				imageSizes({
					default: '100vw',
					768: '25vw',
					1920: '1600px',
				})
			"
			:lazyload="true"
			:alt="image.altText"
		/>

		<!-- auto sizes -->
		<UmbracoImage
			:widths="[320, 375, 640, 750, 1024]"
			:source-url="image.croppedUrl || image.url"
			:source-width="image.width"
			:source-height="image.height"
			sizes="auto"
			:lazyload="true"
			:alt="image.altText"
		/>
	</div>
</template>

<script>
import UmbracoImage, { imageSizes } from '@limbo-works/vue-umbraco-image';

import breakpoints from '~/assets/js/breakpoints';

export default {
	components: {
		UmbracoImage,
	},

	data() {
		return this.$store.state.current.page;
	},

	computed: {
		image() {
			return this.intro.image;
		},
	},

	methods: {
		imageSizes: (sizes) => imageSizes(sizes, breakpoints),
	},
};
</script>
```

## Options

| name                      | type                      | required | default                                |
| ------------------------- | ------------------------- | -------- | -------------------------------------- |
| `sourceUrl`               | `String`                  | `true`   |                                        |
| `sourceWidth`             | `Number`                  | `false`  |                                        |
| `sourceHeight`            | `Number`                  | `false`  |                                        |
| `aspectRatio`             | `Number`                  | `false`  | `this.sourceWidth / this.sourceHeight` |
| `widths`                  | `Array`                   | `true`   |                                        |
| `srcWidth`                | `Number`                  | `false`  | `this.widths[0]`                       |
| `formats`                 | `Object`                  | `false`  | `{ webp: 'image/webp' }`               |
| `transformations`         | `Object`                  | `false`  | `{}`                                   |
| `imageClassNames`         | `[String, Array, Object]` | `false`  |                                        |
| `includeHeightDescriptor` | `Boolean`                 | `false`  | `false`                                |
