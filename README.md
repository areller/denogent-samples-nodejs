# denogent-samples-nodejs

[![Actions Status](https://github.com/areller/denogent-samples-nodejs/workflows/build/badge.svg)](https://github.com/areller/denogent-samples-nodejs/actions)

This is a sample of a NodeJS application that is built using [denogent](https://github.com/areller/denogent) + GitHub Actions

## Build Process

The build process involves

1. [Installing NPM dependencies](https://github.com/areller/denogent-samples-nodejs/blob/e6b981ef38aceaa6cd020dec683d707902653859/build/build.ts#L12)
2. [Running tests](https://github.com/areller/denogent-samples-nodejs/blob/e6b981ef38aceaa6cd020dec683d707902653859/build/build.ts#L18) (the tests rely on Redis to run in the background)
3. [Building a Docker image](https://github.com/areller/denogent-samples-nodejs/blob/e6b981ef38aceaa6cd020dec683d707902653859/build/build.ts#L25)
4. [Pushing the Docker image to a registry on tagged commits](https://github.com/areller/denogent-samples-nodejs/blob/e6b981ef38aceaa6cd020dec683d707902653859/build/build.ts#L30)