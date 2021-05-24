import { shallowMount } from '@vue/test-utils';

import VueResponsiveImage from '../src/vue-responsive-image.vue';
import { ValidationError } from '../src/errors';

describe('VueResponsiveImage', () => {
	it('renders an <img>', () => {
		const wrapper = shallowMount(VueResponsiveImage, {
			propsData: {
				src: '/example.jpg',
			},
		});

		expect(wrapper.html()).toContain(
			'<img src="/example.jpg" class="v-responsive-image">'
		);
	});

	describe('when `src` is passed', () => {
		it('sets `src`', () => {
			const wrapper = shallowMount(VueResponsiveImage, {
				propsData: {
					src: '/example.jpg',
				},
			});

			expect(wrapper.attributes('src')).toBe('/example.jpg');
		});

		it('throws a console warning if `src` missing', () => {
			console.error = jest.fn();

			const consoleErrorMock = jest.spyOn(console, 'error');

			shallowMount(VueResponsiveImage);

			expect(consoleErrorMock).toHaveBeenCalled();
		});

		describe('when `lazyload: true`', () => {
			describe('server-side rendering', () => {
				it('sets `src` to default `placeholder`', () => {
					const wrapper = shallowMount(VueResponsiveImage, {
						propsData: {
							src: '/example.jpg',
							lazyload: true,
						},
					});

					expect(wrapper.attributes('src')).toBe(
						'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
					);
				});

				it('sets `src` to custom `placeholder`', () => {
					const wrapper = shallowMount(VueResponsiveImage, {
						propsData: {
							src: '/example.jpg',
							placeholder:
								'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
							lazyload: true,
						},
					});

					expect(wrapper.attributes('src')).toBe(
						'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
					);
				});

				it('adds `"lazyload"` class name', () => {
					const wrapper = shallowMount(VueResponsiveImage, {
						propsData: {
							src: '/example.jpg',
							lazyload: true,
						},
					});

					expect(wrapper.classes('lazyload')).toBe(true);
				});

				it('sets `src` to `data-src`', () => {
					const wrapper = shallowMount(VueResponsiveImage, {
						propsData: {
							src: '/example.jpg',
							lazyload: true,
						},
					});

					expect(wrapper.attributes('data-src')).toBe('/example.jpg');
				});

				describe('when `fallback: true`', () => {
					it('does not add `"lazyload"` class name', () => {
						const wrapper = shallowMount(VueResponsiveImage, {
							propsData: {
								src: '/example.jpg',
								srcset:
									'/example-small.jpg 100w, /example-medium.jpg 400w',
								sizes: '100vw',
								lazyload: true,
								fallback: true,
							},
						});

						expect(wrapper.classes('lazyload')).toBe(false);
					});
				});
			});

			describe('client-side rendering', () => {
				describe('when `fallback: true`', () => {
					describe('when `loading` attribute is supported', () => {
						it('sets `src` and `loading`', () => {
							const wrapper = shallowMount(VueResponsiveImage, {
								propsData: {
									src: '/example.jpg',
									lazyload: true,
									fallback: true,
								},

								data() {
									return {
										isSSR: false,
										supportsLoadingAttribute: true,
									};
								},
							});

							expect(wrapper.attributes('src')).toBe(
								'/example.jpg'
							);
							expect(wrapper.attributes('loading')).toBe('lazy');
						});
					});

					describe('when `loading` attribute is not supported', () => {
						it('adds `"lazyload"` class name', () => {
							const wrapper = shallowMount(VueResponsiveImage, {
								propsData: {
									src: '/example.jpg',
									lazyload: true,
									fallback: true,
								},

								data() {
									return {
										isSSR: false,
										supportsLoadingAttribute: false,
									};
								},
							});

							expect(wrapper.classes('lazyload')).toBe(true);
						});
					});
				});
			});
		});
	});

	describe('when `src` and `srcset` are passed', () => {
		it('sets `src`, `srcset`, and `sizes`', () => {
			const wrapper = shallowMount(VueResponsiveImage, {
				propsData: {
					src: '/example.jpg',
					srcset: '/example-small.jpg 100w, /example-medium.jpg 400w',
					sizes: '100vw',
				},
			});

			expect(wrapper.attributes('src')).toBe('/example.jpg');
			expect(wrapper.attributes('srcset')).toBe(
				'/example-small.jpg 100w, /example-medium.jpg 400w'
			);
			expect(wrapper.attributes('sizes')).toBe('100vw');
		});

		it('throws a ValidationError if `sizes: "auto"` and `fallback: true` or `lazyload: false`', () => {
			console.error = jest.fn();

			expect(() =>
				shallowMount(VueResponsiveImage, {
					propsData: {
						src: '/example.jpg',
						srcset:
							'/example-small.jpg 100w, /example-medium.jpg 400w',
						sizes: 'auto',
					},
				})
			).toThrow(ValidationError);

			expect(() =>
				shallowMount(VueResponsiveImage, {
					propsData: {
						src: '/example.jpg',
						srcset:
							'/example-small.jpg 100w, /example-medium.jpg 400w',
						sizes: 'auto',
						fallback: true,
					},
				})
			).toThrow(ValidationError);
		});

		it('throws a ValidationError if `srcset` passed without `sizes`', () => {
			console.error = jest.fn();

			expect(() =>
				shallowMount(VueResponsiveImage, {
					propsData: {
						src: '/example.jpg',
						srcset:
							'/example-small.jpg 100w, /example-medium.jpg 400w',
					},
				})
			).toThrow(ValidationError);
		});

		describe('when `lazyload: true`', () => {
			describe('server-side rendering', () => {
				it('sets `src` to the default placeholder', () => {
					const wrapper = shallowMount(VueResponsiveImage, {
						propsData: {
							src: '/example.jpg',
							srcset:
								'/example-small.jpg 100w, /example-medium.jpg 400w',
							sizes: '100vw',
							lazyload: true,
						},
					});

					expect(wrapper.attributes('src')).toBe(
						'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
					);
				});

				it('sets `src` to custom `placeholder`', () => {
					const wrapper = shallowMount(VueResponsiveImage, {
						propsData: {
							src: '/example.jpg',
							srcset:
								'/example-small.jpg 100w, /example-medium.jpg 400w',
							sizes: '100vw',
							placeholder:
								'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
							lazyload: true,
						},
					});

					expect(wrapper.attributes('src')).toBe(
						'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
					);
				});

				it('adds `"lazyload"` class name', () => {
					const wrapper = shallowMount(VueResponsiveImage, {
						propsData: {
							src: '/example.jpg',
							srcset:
								'/example-small.jpg 100w, /example-medium.jpg 400w',
							sizes: '100vw',
							lazyload: true,
						},
					});

					expect(wrapper.classes('lazyload')).toBe(true);
				});

				it('sets `srcset` to `data-srcset`', () => {
					const wrapper = shallowMount(VueResponsiveImage, {
						propsData: {
							src: '/example.jpg',
							srcset:
								'/example-small.jpg 100w, /example-medium.jpg 400w',
							sizes: '100vw',
							lazyload: true,
						},
					});

					expect(wrapper.attributes('data-srcset')).toBe(
						'/example-small.jpg 100w, /example-medium.jpg 400w'
					);
				});

				it('sets `sizes` to `data-sizes`', () => {
					const wrapper = shallowMount(VueResponsiveImage, {
						propsData: {
							src: '/example.jpg',
							sizes: '100vw',
							lazyload: true,
						},
					});

					expect(wrapper.attributes('data-sizes')).toBe('100vw');
				});

				describe('when `fallback: true`', () => {
					it('does not add `"lazyload"` class name', () => {
						const wrapper = shallowMount(VueResponsiveImage, {
							propsData: {
								src: '/example.jpg',
								srcset:
									'/example-small.jpg 100w, /example-medium.jpg 400w',
								sizes: '100vw',
								lazyload: true,
								fallback: true,
							},
						});

						expect(wrapper.classes('lazyload')).toBe(false);
					});
				});
			});

			describe('client-side rendering', () => {
				describe('when `fallback: true`', () => {
					describe('when `loading` attribute is supported', () => {
						it('sets `src`, `srcset`, `sizes`, and `loading`', () => {
							const wrapper = shallowMount(VueResponsiveImage, {
								propsData: {
									src: '/example.jpg',
									srcset:
										'/example-small.jpg 100w, /example-medium.jpg 400w',
									sizes: '100vw',
									lazyload: true,
									fallback: true,
								},

								data() {
									return {
										isSSR: false,
										supportsLoadingAttribute: true,
									};
								},
							});

							expect(wrapper.attributes('src')).toBe(
								'/example.jpg'
							);
							expect(wrapper.attributes('srcset')).toBe(
								'/example-small.jpg 100w, /example-medium.jpg 400w'
							);
							expect(wrapper.attributes('sizes')).toBe('100vw');
							expect(wrapper.attributes('loading')).toBe('lazy');
						});
					});

					describe('when `loading` attribute is not supported', () => {
						it('adds `"lazyload"` class name', () => {
							const wrapper = shallowMount(VueResponsiveImage, {
								propsData: {
									src: '/example.jpg',
									srcset:
										'/example-small.jpg 100w, /example-medium.jpg 400w',
									sizes: '100vw',
									lazyload: true,
									fallback: true,
								},

								data() {
									return {
										isSSR: false,
										supportsLoadingAttribute: false,
									};
								},
							});

							expect(wrapper.classes('lazyload')).toBe(true);
						});
					});
				});
			});
		});
	});
});
