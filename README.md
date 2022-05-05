# Limbo Frontend

## Getting started

In order to publish either new packages or new versions of existing packages, a
`.npmrc` file with a GitHub personal access token is needed
([see documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#:~:text=Authenticating%20with%20a%20personal%20access%20token)).
Copy the snippet below, and insert it into the file to get started:

```
//npm.pkg.github.com/:_authToken=YOUR_TOKEN_HERE
```

## Todo List

-   [ ] agree on linting rules that are ratified in `packages/configs`
-   [ ] decide on whether we should build Vue components at all (do so at point
        of useage instead)
-   [ ] decide on `package.json -> exports` implementation
-   [ ] decide on `modern` and `legacy` Browserslist configs
-   [ ] devise a templating solution for Vue components and Nuxt modules
