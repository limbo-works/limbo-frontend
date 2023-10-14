# `@limbo-works/screens`

> A tool for parsing TailwindCSS `screens` from the standard Limbo breakpoint
> format (as well as a helpful `breakpoints` object)

## Installation

Before installing the package, it's necessary to configure NPM with a GitHub
[Personal Access Token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token)
(PAT) with the `read:packages` scope.

Using your PAT, configure the `.npmrc` in the root of the project like so
_before_ running the install command:-

```npmrc
//npm.pkg.github.com/:_authToken=${PAT}
@limbo-works:registry=https://npm.pkg.github.com
```

Install the package:-

```shell
$ yarn add @limbo-works/screens
```

## Usage

```js
// ~/frontend/assets/js/screens.js

const { default: configure } = require('@limbo-works/screens');

const { breakpoints, screens } = configure([
	{ value: 375, max: true },
	{ value: 768, max: true },
	1024,
	1440,
	1920,
]);

module.exports = { breakpoints, screens };
```

```js
// ~/tailwind.config.js

const { screens } = require('./frontend/assets/js/screens.js');

module.exports = {
	themes: {
		screens,
	},
};
```
