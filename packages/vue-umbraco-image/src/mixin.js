import { FORMATS } from './utilities';

export default {
	props: {
		sourceWidth: {
			type: Number,

			required: true,
		},

		sourceHeight: {
			type: Number,

			required: true,
		},

		aspectRatio: {
			type: Number,

			default() {
				if (this.sourceWidth && this.sourceHeight) {
					return this.sourceWidth / this.sourceHeight;
				}

				throw new Error(
					'Either `aspectRatio` or `sourceWidth` and `sourceHeight` must be set.'
				);
			},
		},

		widths: {
			type: Array,

			required: true,
		},

		srcWidth: {
			type: Number,

			default() {
				return this.widths[0];
			},
		},

		formats: {
			type: Object,

			default: () => FORMATS,
		},

		transformations: {
			type: Object,

			default: () => ({}),
		},

		imageClassNames: [String, Array, Object],

		includeHeightDescriptor: {
			type: Boolean,

			default: false,
		},
	},

	computed: {
		src() {
			const width = this.srcWidth;
			const height = Math.round(width / this.aspectRatio);

			return this.imageUrl(width, height);
		},

		srcset() {
			let { widths } = this;

			if (this.sourceWidth) {
				widths = this.widths.filter(
					(width) => width <= this.sourceWidth
				);
			}

			return widths.map((width) => {
				const height = Math.round(width / this.aspectRatio);
				const source = this.imageUrl(width, height);

				return { source, width, height };
			});
		},

		sources() {
			return Object.entries(this.formats).reduce(
				(acc, [format, type]) => [
					...acc,

					{
						format,
						type,

						[this.$attrs.lazyload
							? 'data-srcset'
							: 'srcset']: this.srcset
							.map(({ source, width, height }) =>
								[
									`${source}&format=${format}`,
									`${width}w`,
									this.includeHeightDescriptor &&
										`${height}h`,
								]
									.filter(Boolean)
									.join(' ')
							)
							.join(', '),
					},
				],
				[]
			);
		},

		defaultSrcset() {
			return this.srcset
				.map(({ source, width, height }) =>
					[
						source,
						`${width}w`,
						this.includeHeightDescriptor && `${height}h`,
					]
						.filter(Boolean)
						.join(' ')
				)
				.join(', ');
		},
	},
};
