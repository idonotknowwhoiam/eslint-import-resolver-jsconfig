# eslint-import-resolver-jsconfig

This is resolver for [eslint-plugin-import](https://www.npmjs.com/package/eslint-plugin-import), which can import your alias from paths in your jsconfig file.

![jsconfig example](https://i.imgur.com/vlvtqdX.png)

I personally use it for easy eslint alias support with [create-react-app](https://github.com/facebook/create-react-app) and [react-app-rewired](https://github.com/timarney/react-app-rewired) + [react-app-rewire-alias](https://github.com/oklas/react-app-rewire-alias).

## Installation

```shell
npm install eslint-import-resolver-jsconfig --save-dev
```
## Usage

Pass this resolver and its parameters to `eslint-plugin-import` using your `eslint` config file

```js
// .eslintrc.json

"settings": {
    "import/resolver": {
        "jsconfig": {
            "config": "jsconfig.json",
        }
    }
},;
```
## Special thanks

[eslint-import-resolver-webpack](https://github.com/import-js/eslint-plugin-import/blob/master/resolvers/webpack/README.md)

[eslint-import-resolver-custom-alias](https://github.com/laysent/eslint-import-resolver-custom-alias)