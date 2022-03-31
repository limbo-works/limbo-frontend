<!--
	Last modified: 2022/03/31 16:36:14
-->
<template>
	<Component
		:is="tag"
		v-if="isExternal"
		class="nuxt-link--ext"
		:class="externalClass"
		:href="to"
		:target="target || '_blank'"
		@click="externalClickHandler"
		v-on="externalEventListeners"
	>
		<slot></slot>
	</Component>
	<NuxtLink
		v-else
		ref="nuxtLink"
		class="nuxt-link--ext"
		v-bind="$props"
		:external-class="null"
	>
		<slot></slot>
	</NuxtLink>
</template>

<script>
'use strict';

module.exports = {
	name: 'NuxtLinkExt',

	props: {
		// Props are copied from NuxtLink - import would be better, but cannot find its location
		// If NuxtLink is found, we could do somehting like ...NuxtLink.props or however that goes.
		// Until then: ugly, but works:
		tag: {
			type: String,
			default: 'a',
		},
		to: {
			type: [String, Object],
			required: true,
		},
		custom: Boolean,
		exact: Boolean,
		exactPath: String,
		append: Boolean,
		replace: Boolean,
		activeClass: String,
		exactActiveClass: String,
		ariaCurrentValue: {
			type: String,
			default: 'page',
		},
		event: {
			type: [String, Array],
			default: 'click',
		},
		prefetch: {
			type: Boolean,
			default: true,
		},
		noPrefetch: {
			type: Boolean,
			default: false,
		},
		prefetchedClass: {
			type: String,
			default: 'nuxt-link--prefetched',
		},
		// Custom for our added feature
		externalClass: {
			type: String,
			default: 'nuxt-link--external',
		},
		// Target as a prop be able to set defaults for external links
		target: {
			type: String,
			default: null,
		},
	},

	computed: {
		isExternal() {
			// Always use NuxtLink when...
			if (this.append || typeof this.to !== 'string') {
				return false;
			}

			// Never use NuxtLink when...
			if (!this.to) {
				return true;
			}
			if (
				['http://', 'https://', 'ftp://'].some(
					(str) => this.to.indexOf(str) === 0
				)
			) {
				return true;
			}
			const splitOut = this.to.split('/');
			if (splitOut[0].indexOf('.') >= 0) {
				/*
					This means that "www.limbo.works" or
					"www.limbo.works/about" will be treated
					as an external link but "/www.limbo.works"
					or "limbo" will not.
				*/
				return true;
			}

			// Default to NuxtLink
			return false;
		},

		externalEventListeners() {
			const array = Array.isArray(this.event) ? this.event : [this.event];
			return array.reduce((acc, event) => {
				acc[`${event}`] = this.externalLinkTrigger;
				return acc;
			}, {});
		},
	},

	methods: {
		// For the handling of external links
		externalClickHandler(e) {
			// If click is not one of the events NuxtLinkExt listens to, but we are dealing with a <a>-tag, we handle it here
			if (
				!this.externalEventListeners?.click &&
				this.$el?.tagName === 'A'
			) {
				this.$listeners?.click?.(e);
				if (!e.defaultPrevented) {
					e.preventDefault();
				}
			}
		},
		externalLinkTrigger(e) {
			this.$listeners?.[e.type]?.(e);
			if (!e.defaultPrevented) {
				e.preventDefault();

				// Default to target="_blank"
				const { target = '_blank' } = this;

				// Create a copy of the link to click
				const link = document.createElement('a');
				Object.keys(this.$attrs).forEach((attrName) => {
					link[attrName] = this.$attrs[attrName];
				});
				link.href = this.to;
				link.target = target;
				link.click();
			}
		},
	},
};
</script>
