# Vue Limbo Link

> Vue component that extends NuxtLink to handle internal and external URLs.

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
$ yarn add @limbo-works/vue-limbo-link
```

## Usage

```vue
<template>
	<LimboLink href="https://google.com">Google</LimboLink>
</template>

<script>
import LimboLink from '@limbo-works/vue-limbo-link';

export default {
	components: {
		LimboLink,
	},
};
</script>
```
