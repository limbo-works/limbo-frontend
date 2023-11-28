<template>
	<div
        v-if="dataReady"
		class="c-umbraco-forms"
		:class="formIsLoading ? 'c-umbraco-forms--loading' : ''"
	>
		<div v-if="formIsLoading" class="c-umbraco-forms__loader">
			<slot name="formIsLoading"> </slot>
		</div>
		<div v-if="formSuccess" class="c-umbraco-forms__success">
			<slot
				name="form-success"
				v-bind="{ messageOnSubmitIsHtml, messageOnSubmit }"
			>
				<div
					v-if="!messageOnSubmitIsHtml"
					class="c-umbraco-forms__success-text"
					role="status"
					v-text="messageOnSubmit"
				></div>
				<div
					v-if="messageOnSubmitIsHtml"
					class="c-umbraco-forms__success-html"
					role="status"
					v-html="messageOnSubmit"
				></div>
			</slot>
		</div>
		<form
			v-if="!formSuccess"
			:id="id"
			ref="formEl"
			:name="name"
			:action="postEndpoint"
			method="POST"
			@submit.prevent="submitForm"
		>
			<slot
				name="formHeader"
				v-bind="{
					previousLabel,
					nextLabel,
					submitLabel,
					changePage,
					currentPage,
					pageCount: pages.length,
					name: definitions.name,
					formErrors,
				}"
			>
				<slot name="title" v-bind="{ name: definitions.name }">
					<div class="c-umbraco-forms__title">
						{{ definitions.name }}
					</div>
				</slot>
			</slot>
			<div
				v-if="Object.keys(formErrors).length && showValidationSummary"
				class="c-umbraco-forms__error"
				role="alert"
			>
				<slot name="errorBox" v-bind="{ formErrors }">
					Error in form
					<ul>
						<li
							v-for="(item, errorIndex) in formErrors"
							:key="errorIndex"
						>
							{{ item }}
						</li>
					</ul>
				</slot>
			</div>

			<section
				v-for="(page, pageIndex) in pages.slice(
					0,
					highestViewedPage + 1
				)"
				:key="pageIndex"
				class="c-umbraco-forms__page"
				:hidden="currentPage !== pageIndex ? 'hidden' : null"
				:class="
					currentPage !== pageIndex
						? 'c-umbraco-forms__page--hidden'
						: ''
				"
			>
				<div class="c-umbraco-forms__page-caption">
					{{ page.caption }}
				</div>
				<fieldset
					v-for="(fieldset, fieldsetIndex) in page.fieldsets"
					:key="fieldsetIndex"
					class="c-umbraco-forms__fieldset"
				>
					<legend class="c-umbraco-forms__legend">
						{{ fieldset.caption }}
					</legend>
					<div
						v-for="(column, columnIndex) in fieldset.columns"
						:key="columnIndex"
						class="c-umbraco-forms__column"
					>
						<div
							v-for="(field, fieldIndex) in column.fields"
							:key="fieldIndex"
							:hidden="
								fieldVisibilityObject[field.id].visible
									? null
									: 'hidden'
							"
							:class="[
								'c-umbraco-forms__field',
								`c-umbraco-forms__field--name--${field.type.name
									.replace(/\s+/g, '-')
									.toLowerCase()}`,
								field.settings.fieldType
									? `c-umbraco-forms__field--type--${field.settings.fieldType}`
									: '',
								{
									'c-umbraco-forms__field--hidden':
										!fieldVisibilityObject[field.id]
											.visible,
								},
							]"
						>
							<template v-if="field.type.name === 'Short answer'">
								<template
									v-if="field.settings.fieldType === 'text'"
								>
									<slot
										name="text"
										v-bind="bindValues(field)"
									>
										<label
											v-if="
												field.settings.showLabel !==
												'False'
											"
											:for="`uf-${field.id}`"
										>
											{{ field.caption }}
											<span
												v-if="
													fieldsObject[field.id]
														.showIndicator
												"
												v-text="definitions.indicator"
											/>
										</label>
										<div
											v-if="field.helpText"
											class="c-umbraco-forms__field-help-text"
											v-text="field.helpText"
										/>
										<input
											v-model="
												fieldsObject[field.id].value
											"
											type="text"
											v-bind="bindDefaultValues(field)"
											@invalid="
												(e) => onInvalid(e, field)
											"
										/>

										<div
											v-if="
												formErrors[field.alias] &&
												!hideFieldValidation
											"
											class="c-umbraco-forms__field-error-message"
											role="alert"
										>
											{{ formErrors[field.alias][0] }}
										</div>
									</slot>
								</template>
								<template
									v-else-if="
										field.settings.fieldType === 'week'
									"
								>
									<slot
										name="week"
										v-bind="bindValues(field)"
									>
										<slot
											name="date"
											v-bind="bindValues(field)"
										>
											<slot
												name="text"
												v-bind="bindValues(field)"
											>
												<label
													v-if="
														field.settings
															.showLabel !==
														'False'
													"
													:for="`uf-${field.id}`"
												>
													{{ field.caption }}
													<span
														v-if="
															fieldsObject[
																field.id
															].showIndicator
														"
														v-text="
															definitions.indicator
														"
													/>
												</label>
												<div
													v-if="field.helpText"
													class="c-umbraco-forms__field-help-text"
													v-text="field.helpText"
												/>
												<input
													v-model="
														fieldsObject[field.id]
															.value
													"
													type="week"
													v-bind="
														bindDefaultValues(field)
													"
												/>
												<div
													v-if="
														formErrors[field.alias]
													"
													class="c-umbraco-forms__field-error-message"
													role="alert"
												>
													{{
														formErrors[
															field.alias
														][0]
													}}
												</div>
											</slot>
										</slot>
									</slot>
								</template>
								<template
									v-else-if="
										field.settings.fieldType === 'date'
									"
								>
									<slot
										name="date"
										v-bind="bindValues(field)"
									>
										<label
											v-if="
												field.settings.showLabel !==
												'False'
											"
											:for="`uf-${field.id}`"
										>
											{{ field.caption }}
											<span
												v-if="
													fieldsObject[field.id]
														.showIndicator
												"
												v-text="definitions.indicator"
											/>
										</label>
										<div
											v-if="field.helpText"
											class="c-umbraco-forms__field-help-text"
											v-text="field.helpText"
										/>
										<input
											v-model="
												fieldsObject[field.id].value
											"
											type="date"
											v-bind="bindDefaultValues(field)"
										/>
										<div
											v-if="
												formErrors[field.alias] &&
												!hideFieldValidation
											"
											class="c-umbraco-forms__field-error-message"
											role="alert"
										>
											{{ formErrors[field.alias][0] }}
										</div>
									</slot>
								</template>
								<template
									v-else-if="
										field.settings.fieldType ===
										'datetime-local'
									"
								>
									<slot
										name="datetimeLocal"
										v-bind="bindValues(field)"
									>
										<slot
											name="date"
											v-bind="bindValues(field)"
										>
											<label
												v-if="
													field.settings.showLabel !==
													'False'
												"
												:for="`uf-${field.id}`"
											>
												{{ field.caption }}
												<span
													v-if="
														fieldsObject[field.id]
															.showIndicator
													"
													v-text="
														definitions.indicator
													"
												/>
											</label>
											<div
												v-if="field.helpText"
												class="c-umbraco-forms__field-help-text"
												v-text="field.helpText"
											/>
											<input
												v-model="
													fieldsObject[field.id].value
												"
												type="datetime-local"
												v-bind="
													bindDefaultValues(field)
												"
											/>
											<div
												v-if="
													formErrors[field.alias] &&
													!hideFieldValidation
												"
												class="c-umbraco-forms__field-error-message"
												role="alert"
											>
												{{ formErrors[field.alias][0] }}
											</div>
										</slot>
									</slot>
								</template>
								<template
									v-else-if="
										field.settings.fieldType === 'email'
									"
								>
									<slot
										name="email"
										v-bind="bindValues(field)"
									>
										<slot
											name="text"
											v-bind="bindValues(field)"
										>
											<label
												v-if="
													field.settings.showLabel !==
													'False'
												"
												:for="`uf-${field.id}`"
											>
												{{ field.caption }}
												<span
													v-if="
														fieldsObject[field.id]
															.showIndicator
													"
													v-text="
														definitions.indicator
													"
												/>
											</label>
											<div
												v-if="field.helpText"
												class="c-umbraco-forms__field-help-text"
												v-text="field.helpText"
											/>
											<input
												v-model="
													fieldsObject[field.id].value
												"
												type="email"
												v-bind="
													bindDefaultValues(field)
												"
											/>
											<div
												v-if="
													formErrors[field.alias] &&
													!hideFieldValidation
												"
												class="c-umbraco-forms__field-error-message"
												role="alert"
											>
												{{ formErrors[field.alias][0] }}
											</div>
										</slot>
									</slot>
								</template>
								<template
									v-else-if="
										field.settings.fieldType === 'tel'
									"
								>
									<slot name="tel" v-bind="bindValues(field)">
										<slot
											name="text"
											v-bind="bindValues(field)"
										>
											<label
												v-if="
													field.settings.showLabel !==
													'False'
												"
												:for="`uf-${field.id}`"
											>
												{{ field.caption }}
												<span
													v-if="
														fieldsObject[field.id]
															.showIndicator
													"
													v-text="
														definitions.indicator
													"
												/>
											</label>
											<div
												v-if="field.helpText"
												class="c-umbraco-forms__field-help-text"
												v-text="field.helpText"
											/>
											<input
												v-model="
													fieldsObject[field.id].value
												"
												type="tel"
												v-bind="
													bindDefaultValues(field)
												"
											/>
											<div
												v-if="
													formErrors[field.alias] &&
													!hideFieldValidation
												"
												class="c-umbraco-forms__field-error-message"
												role="alert"
											>
												{{ formErrors[field.alias][0] }}
											</div>
										</slot>
									</slot>
								</template>
								<template
									v-else-if="
										field.settings.fieldType === 'number'
									"
								>
									<slot
										name="number"
										v-bind="bindValues(field)"
									>
										<slot
											name="text"
											v-bind="bindValues(field)"
										>
											<label
												v-if="
													field.settings.showLabel !==
													'False'
												"
												:for="`uf-${field.id}`"
											>
												{{ field.caption }}
												<span
													v-if="
														fieldsObject[field.id]
															.showIndicator
													"
													v-text="
														definitions.indicator
													"
												/>
											</label>
											<div
												v-if="field.helpText"
												class="c-umbraco-forms__field-help-text"
												v-text="field.helpText"
											/>
											<input
												v-model="
													fieldsObject[field.id].value
												"
												type="number"
												v-bind="
													bindDefaultValues(field)
												"
											/>
											<div
												v-if="
													formErrors[field.alias] &&
													!hideFieldValidation
												"
												class="c-umbraco-forms__field-error-message"
												role="alert"
											>
												{{ formErrors[field.alias][0] }}
											</div>
										</slot>
									</slot>
								</template>
								<template
									v-else-if="
										field.settings.fieldType === 'time'
									"
								>
									<slot
										name="time"
										v-bind="bindValues(field)"
									>
										<slot
											name="text"
											v-bind="bindValues(field)"
										>
											<label
												v-if="
													field.settings.showLabel !==
													'False'
												"
												:for="`uf-${field.id}`"
											>
												{{ field.caption }}
												<span
													v-if="
														fieldsObject[field.id]
															.showIndicator
													"
													v-text="
														definitions.indicator
													"
												/>
											</label>
											<div
												v-if="field.helpText"
												class="c-umbraco-forms__field-help-text"
												v-text="field.helpText"
											/>
											<input
												v-model="
													fieldsObject[field.id].value
												"
												type="time"
												v-bind="
													bindDefaultValues(field)
												"
											/>
											<div
												v-if="
													formErrors[field.alias] &&
													!hideFieldValidation
												"
												class="c-umbraco-forms__field-error-message"
												role="alert"
											>
												{{ formErrors[field.alias][0] }}
											</div>
										</slot>
									</slot>
								</template>
								<template
									v-else-if="
										field.settings.fieldType === 'url'
									"
								>
									<slot name="url" v-bind="bindValues(field)">
										<slot
											name="text"
											v-bind="bindValues(field)"
										>
											<label
												v-if="
													field.settings.showLabel !==
													'False'
												"
												:for="`uf-${field.id}`"
											>
												{{ field.caption }}
												<span
													v-if="
														fieldsObject[field.id]
															.showIndicator
													"
													v-text="
														definitions.indicator
													"
												/>
											</label>
											<div
												v-if="field.helpText"
												class="c-umbraco-forms__field-help-text"
												v-text="field.helpText"
											/>
											<input
												v-model="
													fieldsObject[field.id].value
												"
												type="url"
												v-bind="
													bindDefaultValues(field)
												"
											/>
											<div
												v-if="
													formErrors[field.alias] &&
													!hideFieldValidation
												"
												class="c-umbraco-forms__field-error-message"
												role="alert"
											>
												{{ formErrors[field.alias][0] }}
											</div>
										</slot>
									</slot>
								</template>
								<template v-else>
									<slot
										name="text"
										v-bind="bindValues(field)"
									>
										<label
											v-if="
												field.settings.showLabel !==
												'False'
											"
											:for="`uf-${field.id}`"
										>
											{{ field.caption }}
											<span
												v-if="
													fieldsObject[field.id]
														.showIndicator
												"
												v-text="definitions.indicator"
											/>
										</label>
										<div
											v-if="field.helpText"
											class="c-umbraco-forms__field-help-text"
											v-text="field.helpText"
										/>
										<input
											v-bind="bindDefaultValues(field)"
											v-model="
												fieldsObject[field.id].value
											"
											type="text"
										/>
										<div
											v-if="
												formErrors[field.alias] &&
												!hideFieldValidation
											"
											class="c-umbraco-forms__field-error-message"
											role="alert"
										>
											{{ formErrors[field.alias][0] }}
										</div>
									</slot>
								</template>
							</template>
							<template
								v-else-if="field.type.name === 'Long answer'"
							>
								<slot
									name="textArea"
									v-bind="bindValues(field)"
								>
									<label
										v-if="
											field.settings.showLabel !== 'False'
										"
										:for="`uf-${field.id}`"
									>
										{{ field.caption }}
										<span
											v-if="
												fieldsObject[field.id]
													.showIndicator
											"
											v-text="definitions.indicator"
										/>
									</label>
									<div
										v-if="field.helpText"
										class="c-umbraco-forms__field-help-text"
										v-text="field.helpText"
									/>
									<textarea
										v-model="fieldsObject[field.id].value"
										v-bind="bindDefaultValues(field)"
										:rows="field.settings.numberOfRows"
										@invalid="(e) => onInvalid(e, field)"
									></textarea>
									<div
										v-if="
											formErrors[field.alias] &&
											!hideFieldValidation
										"
										class="c-umbraco-forms__field-error-message"
										role="alert"
									>
										{{ formErrors[field.alias][0] }}
									</div>
								</slot>
							</template>
							<template v-else-if="field.type.name === 'Date'">
								<slot name="date" v-bind="bindValues(field)">
									<label
										v-if="
											field.settings.showLabel !== 'False'
										"
										:for="`uf-${field.id}`"
									>
										{{ field.caption }}
										<span
											v-if="
												fieldsObject[field.id]
													.showIndicator
											"
											v-text="definitions.indicator"
										/>
									</label>
									<div
										v-if="field.helpText"
										class="c-umbraco-forms__field-help-text"
										v-text="field.helpText"
									/>
									<input
										v-model="fieldsObject[field.id].value"
										type="date"
										v-bind="bindDefaultValues(field)"
									/>
									<div
										v-if="
											formErrors[field.alias] &&
											!hideFieldValidation
										"
										class="c-umbraco-forms__field-error-message"
										role="alert"
									>
										{{ formErrors[field.alias][0] }}
									</div>
								</slot>
							</template>
							<template
								v-else-if="field.type.name === 'Password'"
							>
								<slot
									name="password"
									v-bind="bindValues(field)"
								>
									<slot
										name="text"
										v-bind="bindValues(field)"
									>
										<label
											v-if="
												field.settings.showLabel !==
												'False'
											"
											:for="`uf-${field.id}`"
										>
											{{ field.caption }}
											<span
												v-if="
													fieldsObject[field.id]
														.showIndicator
												"
												v-text="definitions.indicator"
											/>
										</label>
										<div
											v-if="field.helpText"
											class="c-umbraco-forms__field-help-text"
											v-text="field.helpText"
										/>
										<input
											v-model="
												fieldsObject[field.id].value
											"
											type="password"
											v-bind="bindDefaultValues(field)"
										/>
										<div
											v-if="
												formErrors[field.alias] &&
												!hideFieldValidation
											"
											class="c-umbraco-forms__field-error-message"
											role="alert"
										>
											{{ formErrors[field.alias][0] }}
										</div>
									</slot>
								</slot>
							</template>
							<template v-else-if="field.type.name === 'Hidden'">
								<slot name="hidden" v-bind="bindValues(field)">
									<input
										v-model="fieldsObject[field.id].value"
										type="hidden"
										v-bind="bindDefaultValues(field)"
									/>
								</slot>
							</template>
							<template
								v-else-if="field.type.name === 'Checkbox'"
							>
								<slot
									name="checkbox"
									v-bind="bindValues(field)"
								>
									<label
										v-if="
											field.settings.showLabel !== 'False'
										"
										:for="`uf-${field.id}`"
									>
										{{ field.caption }}
										<span
											v-if="
												fieldsObject[field.id]
													.showIndicator
											"
											v-text="definitions.indicator"
										/>
									</label>
									<div
										v-if="field.helpText"
										class="c-umbraco-forms__field-help-text"
										v-text="field.helpText"
									/>
									<input
										v-bind="bindDefaultValues(field)"
										v-model="fieldsObject[field.id].value"
										type="checkbox"
									/>
									<div
										v-if="
											formErrors[field.alias] &&
											!hideFieldValidation
										"
										class="c-umbraco-forms__field-error-message"
										role="alert"
									>
										{{ formErrors[field.alias][0] }}
									</div>
								</slot>
							</template>
							<template
								v-else-if="field.type.name === 'Single choice'"
							>
								<slot
									name="radioList"
									v-bind="bindValues(field)"
								>
									<p
										v-if="
											field.settings.showLabel !== 'False'
										"
										class="c-umbraco-forms__field-caption"
									>
										{{ field.caption }}
										<span
											v-if="
												fieldsObject[field.id]
													.showIndicator
											"
											v-text="definitions.indicator"
										/>
									</p>
									<div
										v-if="field.helpText"
										class="c-umbraco-forms__field-help-text"
										v-text="field.helpText"
									/>
									<label
										v-for="radio in field.preValues"
										:key="radio.value"
									>
										<input
											v-bind="bindDefaultValues(field)"
											type="radio"
											:value="radio.value"
										/>
										{{ radio.caption }}
									</label>
									<div
										v-if="
											formErrors[field.alias] &&
											!hideFieldValidation
										"
										class="c-umbraco-forms__field-error-message"
										role="alert"
									>
										{{ formErrors[field.alias][0] }}
									</div>
								</slot>
							</template>
							<template
								v-else-if="
									field.type.name === 'Multiple choice'
								"
							>
								<slot
									name="checkboxList"
									v-bind="bindValues(field)"
								>
									<p
										v-if="
											field.settings.showLabel !== 'False'
										"
										class="c-umbraco-forms__field-caption"
									>
										{{ field.caption }}
										<span
											v-if="
												fieldsObject[field.id]
													.showIndicator
											"
											v-text="definitions.indicator"
										/>
									</p>
									<div
										v-if="field.helpText"
										class="c-umbraco-forms__field-help-text"
										v-text="field.helpText"
									/>

									<label
										v-for="radio in field.preValues"
										:key="radio.value"
									>
										<input
											v-bind="bindDefaultValues(field)"
											type="checkbox"
											:value="radio.value"
										/>
										{{ radio.caption }}
									</label>
									<div
										v-if="
											formErrors[field.alias] &&
											!hideFieldValidation
										"
										class="c-umbraco-forms__field-error-message"
										role="alert"
									>
										{{ formErrors[field.alias][0] }}
									</div>
								</slot>
							</template>
							<template
								v-else-if="field.type.name === 'Data Consent'"
							>
								<slot
									name="dataConsent"
									v-bind="bindValues(field)"
								>
									<label
										v-if="
											field.settings.showLabel !== 'False'
										"
										:for="`uf-${field.id}`"
									>
										{{ field.caption }}
										<span
											v-if="
												fieldsObject[field.id]
													.showIndicator
											"
											v-text="definitions.indicator"
										/>
									</label>
									<div
										v-if="field.helpText"
										class="c-umbraco-forms__field-help-text"
										v-text="field.helpText"
									/>
									<input
										v-bind="bindDefaultValues(field)"
										v-model="fieldsObject[field.id].value"
										type="checkbox"
									/>
									<div
										v-if="
											formErrors[field.alias] &&
											!hideFieldValidation
										"
										class="c-umbraco-forms__field-error-message"
										role="alert"
									>
										{{ formErrors[field.alias][0] }}
									</div>
								</slot>
							</template>
							<template
								v-else-if="field.type.name === 'Dropdown'"
							>
								<slot name="select" v-bind="bindValues(field)">
									<label
										v-if="
											field.settings.showLabel !== 'False'
										"
										:for="`uf-${field.id}`"
									>
										{{ field.caption }}
										<span
											v-if="
												fieldsObject[field.id]
													.showIndicator
											"
											v-text="definitions.indicator"
										/>
									</label>
									<div
										v-if="field.helpText"
										class="c-umbraco-forms__field-help-text"
										v-text="field.helpText"
									/>
									<select
										v-model="fieldsObject[field.id].value"
										v-bind="bindDefaultValues(field)"
									>
										<option
											v-for="option in field.preValues"
											:key="option.value"
											:value="option.value"
										>
											{{ option.caption }}
										</option>
									</select>
									<div
										v-if="
											formErrors[field.alias] &&
											!hideFieldValidation
										"
										class="c-umbraco-forms__field-error-message"
										role="alert"
									>
										{{ formErrors[field.alias][0] }}
									</div>
								</slot>
							</template>
							<template
								v-else-if="field.type.name === 'File upload'"
							>
								<slot name="file" v-bind="bindValues(field)">
									<label
										v-if="
											field.settings.showLabel !== 'False'
										"
										:for="`uf-${field.id}`"
									>
										{{ field.caption }}
										<span
											v-if="
												fieldsObject[field.id]
													.showIndicator
											"
											v-text="definitions.indicator"
										/>
									</label>
									<div
										v-if="field.helpText"
										class="c-umbraco-forms__field-help-text"
										v-text="field.helpText"
									/>
                                    <!-- eslint-disable -->
									<input
										v-bind="bindDefaultValues(field)"
										type="file"
										:accept="
											field.fileUploadOptions
												.allowAllUploadExtensions
												? null
												: field.fileUploadOptions.allowedUploadExtensions.toString()
										"
									/>
                                     <!-- eslint-enable -->
									<div
										v-if="
											formErrors[field.alias] &&
											!hideFieldValidation
										"
										class="c-umbraco-forms__field-error-message"
										role="alert"
									>
										{{ formErrors[field.alias][0] }}
									</div>
								</slot>
							</template>

							<template
								v-else-if="field.type.name === 'Rich text'"
							>
								<slot
									name="richText"
									v-bind="bindValues(field)"
								>
									<div
										:id="`uf-${field.id}`"
										v-html="field.settings.html"
									></div>
								</slot>
							</template>
							<div
								v-else-if="
									field.type.name === 'Title and description'
								"
								:id="`uf-${field.id}`"
							>
								<slot
									name="titleDescription"
									v-bind="bindValues(field)"
								>
									<Component
										:is="field.settings.captionTag"
										>{{ field.settings.caption }}</Component
									>
									<p>{{ field.settings.bodyText }}</p>
								</slot>
							</div>
						</div>
					</div>
				</fieldset>
			</section>
			<slot
				name="formFooter"
				v-bind="{
					previousLabel,
					nextLabel,
					submitLabel,
					changePage,
					currentPage,
					pageCount: pages.length,
				}"
			>
				<footer class="c-umbraco-forms__buttons">
					<button
						type="button"
						class="c-umbraco-forms__button c-umbraco-forms__button--prev"
						:hidden="currentPage === 0 ? 'hidden' : null"
						:class="
							currentPage === 0
								? 'c-umbraco-forms__button--hidden'
								: ''
						"
						@click="changePage('previous')"
					>
						{{ previousLabel }}
					</button>
					<button
						type="button"
						class="c-umbraco-forms__button c-umbraco-forms__button--next"
						:hidden="
							currentPage === pages.length - 1 ? 'hidden' : null
						"
						:class="
							currentPage === pages.length - 1
								? 'c-umbraco-forms__button--hidden'
								: ''
						"
						@click="changePage('next')"
					>
						{{ nextLabel }}
					</button>
					<input
						class="c-umbraco-forms__button c-umbraco-forms__button--submit"
						:hidden="
							currentPage !== pages.length - 1 ? 'hidden' : null
						"
						:class="
							currentPage !== pages.length - 1
								? 'c-umbraco-forms__button--hidden'
								: ''
						"
						type="submit"
						:value="submitLabel"
					/>
				</footer>
			</slot>
		</form>
	</div>
</template>

<script>
export default {
	data() {
		return {
			formEl: null,
			currentPage: 0,
			highestViewedPage: 0,
			formErrors: {},
			formSuccess: false,
			formIsLoading: true,
			definitions: null,
			flatFields: [],
			fields: {},
			fieldsObject: {},
			fieldVisibilityObject: {},
			rulesArray: [],
			invalidMap: new Map(),
			dataReady: false,
		};
	},
	props: {
		content: Object,
		definitionsEndpoint: String,
		postEndpoint: String,
		id: String,
		name: String,
	},
	computed: {
		pages() {
			return this.definitions.pages || [];
		},
		hideFieldValidation() {
			return this.definitions.hideFieldValidation || false;
		},
		showValidationSummary() {
			return this.definitions.showValidationSummary || false;
		},
		messageOnSubmitIsHtml() {
			return this.definitions.messageOnSubmitIsHtml || false;
		},
		messageOnSubmit() {
			return this.definitions.messageOnSubmit || '';
		},
		submitLabel() {
			return this.definitions.submitLabel || 'Submit';
		},
		previousLabel() {
			return this.definitions.previousLabel || 'Previous';
		},
		nextLabel() {
			return this.definitions.nextLabel || 'Next';
		},
	},
	mounted() {
		this.fetchDefinitions();
	},
	methods: {
		async fetchDefinitions() {
			const response = await fetch(this.definitionsEndpoint);
			this.definitions = await response.json();
			this.processDefinitions();
			this.fieldVisibilityObject = this.getFieldsRules();
			this.rulesArray = this.getRules();
			this.checkVisibility();
			this.formIsLoading = false;
			this.dataReady = true;
		},
		processDefinitions() {
			this.pages.forEach((page, index) => {
				page.fieldsets.forEach((fieldset) => {
					fieldset.columns.forEach((col) => {
						col.fields.forEach((field) => {
							this.flatFields.push(Object.assign({}, field, { page: index }));
						});
					});
				});
			});

			const fields = {};
			this.flatFields.forEach((field) => {
				fields[field.id] = {
					alias: field.alias,
					condition: field.condition,
					required: field.required,
					value: field.settings.defaultValue ? field.settings.defaultValue : '',
					type: field.type,
					showIndicator:
			this.definitions.fieldIndicationType === 'NoIndicator' ||
			this.definitions.fieldIndicationType === 'MarkMandatoryFields'
				? field.required
				: !field.required,
				};
			});

			this.fieldsObject = fields;
		},
		getFieldsRules() {
			const fields = {};
			this.flatFields.forEach((field) => {
				fields[field.id] =
                Object.assign({}, field.condition, { visible: false });
			});
			return fields;
		},
		getRules() {
			const fields = [];
			this.flatFields.forEach((field) => {
				if (field.condition && field.condition.rules &&
                field.condition.rules.length !== 0) {
					const newArr = field.condition.rules.map(el => (
						Object.assign({}, el, { dependant: field.id,
							conditionMet: false })
					));
					fields.push(...newArr);
				}
			});

			return fields;
		},
		checkRules(fields) {
			this.rulesArray.forEach((item) => {
				this.checkSingleRules(item, fields);
			});
			// ... same as in your Vue 3 code
		},
		checkSingleRules(item, fields) {
			if (item.operator === 'Is') {
				if (fields[item.field].value === item.value) {
					item.conditionMet = true;
				} else {
					item.conditionMet = false;
				}
			}
			if (item.operator === 'IsNot') {
				if (fields[item.field].value !== item.value) {
					item.conditionMet = true;
				} else {
					item.conditionMet = false;
				}
			}
			if (item.operator === 'GreaterThen') {
				if (
					fields[item.field].value !== '' &&
			parseInt(fields[item.field].value, 10) > parseInt(item.value, 10)
				) {
					item.conditionMet = true;
				} else {
					item.conditionMet = false;
				}
			}
			if (item.operator === 'LessThen') {
				if (
					fields[item.field].value !== '' &&
			parseInt(fields[item.field].value, 10) < parseInt(item.value, 10)
				) {
					item.conditionMet = true;
				} else {
					item.conditionMet = false;
				}
			}
			if (item.operator === 'Contains') {
				if (fields[item.field].value.includes(item.value)) {
					item.conditionMet = true;
				} else {
					item.conditionMet = false;
				}
			}
			if (item.operator === 'EndsWith') {
				if (fields[item.field].value.endsWith(item.value)) {
					item.conditionMet = true;
				} else {
					item.conditionMet = false;
				}
			}
			if (item.operator === 'StartsWith') {
				if (fields[item.field].value.startsWith(item.value)) {
					item.conditionMet = true;
				} else {
					item.conditionMet = false;
				}
			}
		},
		checkVisibility() {
			// eslint-disable-next-line no-restricted-syntax
			for (const [key, value] of Object.entries(this.fieldVisibilityObject)) {
				this.checkSingleFieldVisibility(key, value.actionType, value.logicType);
			}
		},
		checkSingleFieldVisibility(id, actionType, logicType) {
			const rules = this.rulesArray.filter(rule => rule.dependant === id);

			if (actionType === undefined || logicType === undefined) {
				this.fieldVisibilityObject[id].visible = true;
			} else if (actionType === 'Show' && logicType === 'All') {
				const result = rules.find(rule => rule.conditionMet === false);

				if (result === undefined) {
					this.fieldVisibilityObject[id].visible = true;
				} else {
					this.fieldVisibilityObject[id].visible = false;
				}
			} else if (actionType === 'Show' && logicType === 'Any') {
				const result = rules.find(rule => rule.conditionMet === true);

				if (result === undefined) {
					this.fieldVisibilityObject[id].visible = false;
				} else {
					this.fieldVisibilityObject[id].visible = true;
				}
			} else if (actionType === 'Hide' && logicType === 'All') {
				const result = rules.find(rule => rule.conditionMet === false);

				if (result === undefined) {
					this.fieldVisibilityObject[id].visible = false;
				} else {
					this.fieldVisibilityObject[id].visible = true;
				}
			} else if (actionType === 'Hide' && logicType === 'Any') {
				const result = rules.find(rule => rule.conditionMet === true);

				if (result === undefined) {
					this.fieldVisibilityObject[id].visible = true;
				} else {
					this.fieldVisibilityObject[id].visible = false;
				}
			}
		},
		bindValues(field) {
			const fieldSettings = Object.assign({}, field.settings, {
				defaultValue: field.type.name === 'Checkbox'
					? 'on'
					: field.settings.defaultValue,

			});
			const mergedField = Object.assign({}, field, { settings: {
				fieldSettings,
			} });
			return {
				id: `uf-${field.id}`,
				modelValue: this.fieldsObject[field.id].value,
				required: field.required,
				fieldName: field.alias,
				field: mergedField,
				setModelValue: this.setModelValue,
				errors: this.formErrors[field.alias],
				showIndicator:
			this.definitions.fieldIndicationType === 'NoIndicator' ||
			this.definitions.fieldIndicationType === 'MarkMandatoryFields'
				? field.required
				: !field.required,
				showLabel: field.settings.showLabel,
				pattern: field.pattern,
				placeholder: field.placeholder || field.settings.placeholder,
				onInvalid: this.onInvalid,
			};
		},
		bindDefaultValues(field) {
			return {
				id: `uf-${field.id}`,
				required: field.required,
				name: field.alias,
				pattern: field.pattern ? field.pattern : null,
				maxlength: field.settings.maximumLength
					? field.settings.maximumLength
					: null,
				placeholder:
			field.placeholder || field.settings.placeholder
				? field.placeholder || field.settings.placeholder
				: null,
			};
		},
		onInvalid(event, field) {
			event.target.setCustomValidity('');
			if (
				event.target.validity.patternMismatch &&
		field.patternInvalidErrorMessage
			) {
				this.invalidMap.set(field.alias, event.target);
				event.target.setCustomValidity(field.patternInvalidErrorMessage);
			}
			if (event.target.validity.valueMissing && field.requiredErrorMessage) {
				this.invalidMap.set(field.alias, event.target);
				event.target.setCustomValidity(field.requiredErrorMessage);
			}
		},
		clearInvalid() {
			this.invalidMap.forEach((value, key) => {
				value.setCustomValidity('');
				this.invalidMap.delete(key);
			});
		},
		setModelValue(event) {
			const id = event.target.id.substring(3);
			this.fieldsObject[id].value = event.target.value;
		},
		async submitForm() {
			const form = new FormData(this.$refs.formEl);
			this.formIsLoading = true;
			this.formErrors = {};

			// multiple choice array
			const multipeChoiceArray = [];
			// eslint-disable-next-line no-restricted-syntax
			for (const [id, field] of Object.entries(this.fieldsObject)) {
				if (field.type.name !== 'File upload') {
					if (field.type.name === 'Multiple choice') {
						multipeChoiceArray.push(field.alias);
					}
					if (Array.isArray(field.value)) {
						form.set(field.alias, field.value.toString());
					} else if (field.value !== '') {
						form.set(field.alias, field.value);
					}
				}
			}
			const data = {
				values: {},
			};
			// eslint-disable-next-line no-restricted-syntax
			for (const [key, value] of form) {
				// For file uploads, we need to transform the value into a structure containing
				// the file name and the base 64 encoded file contents.
				if (this.isFileUpload(value)) {
					const fileName = value.name;
					const fileContents = this.getFileAsBase64(value);
					// We could have multiple files on a field, so need to provide as an array.
					if (!data.values[key]) {
						data.values[key] = [];
					}
					data.values[key].push({
						fileName,
						fileContents,
					});
				} else if (multipeChoiceArray.includes(key)) {
					data.values[key] = form.getAll(key);
				} else {
					data.values[key] = value;
				}
			}
			const response = await fetch(this.postEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});
			if (response.status === 202 || response.status === 204) {
				this.formIsLoading = false;
				this.formSuccess = true;
			} else if (response.status === 422) {
				this.formIsLoading = false;
				this.formErrors = response.errors;

				let goToPage = null;
				/* eslint-disable */
				for (const [key] of Object.entries(response.errors)) {
					const field = this.flatFields.find(field => field.alias === key);
					if (field.page < goToPage || goToPage === null) {
						goToPage = field.page;
					}
				}
                /* eslint-enable */
				this.changePage(goToPage);
			} else {
				this.formIsLoading = false;
				console.log(`Error (${response.status}): ${response.statusText}`);
			}
		},
		isFileUpload(value) {
			return 'File' in window && value instanceof File;
		},
		getFileAsBase64(file) {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.readAsDataURL(file);
				reader.onload = () => {
					const { result } = reader;
					if (typeof result === 'string') {
						resolve(
							`data:${file.type};base64,${result.split(',')[1]}`,
						);
					} else {
						reject('Error reading file as base64.');
					}
				};
				reader.onerror = error => reject(error);
			});
		},
		changePage(direction) {
			this.formIsLoading = true;
			if (typeof direction === 'number') {
				this.currentPage = direction;
			}
			if (direction === 'next' && this.pages.length > this.currentPage + 1) {
				if (!this.$refs.formEl.reportValidity()) {
					this.formIsLoading = false;
					return;
				}
				this.currentPage++;
				this.highestViewedPage++;
			}
			if (direction === 'previous' && this.currentPage > 0) {
				if (!this.$refs.formEl.reportValidity()) {
					this.formIsLoading = false;
					return;
				}
				this.currentPage--;
			}
			this.formIsLoading = false;
		},
	},
	watch: {
		fieldsObject: {
			handler() {
				this.clearInvalid();
				this.checkRules();
				this.checkVisibility();
			},
			deep: true,
		},
	},
};
</script>

<style>
:where(.c-umbraco-forms__success-text) {
	white-space: pre-wrap;
}
</style>
