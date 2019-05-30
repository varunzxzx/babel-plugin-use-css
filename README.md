# babel-plugin-use-css

> Allow extracting static CSS from [use-css](https://github.com/siddharthkp/use-css#readme)

## Install

Using npm:

```sh
npm install --save-dev babel-plugin-use-css
```

or using yarn:

```sh
yarn add babel-plugin-use-css --dev
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["babel-plugin-use-css"]
}
```

### Via CLI

```sh
babel --plugins babel-plugin-use-css script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["babel-plugin-use-css"]
});
```

## Outputs

> bundle.css

## License

MIT © [varunzxzx](https://github.com/varunzxzx)
