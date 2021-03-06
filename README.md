# NGX-MONO
# Strict Development Monorepo for Angular

## Requirements
- Node
- NPM

## Quickstart
- Clone Repo
- Install NPM Modules
- Checkout strictdev git branch
- Navigate to strictdev/public_website
- Run Clientside Dev server
- Open Browser to <http://localhost:8080>

```
git clone https://github.com/strictd/ngx-mono.git
cd ngx-mono
npm install
git checkout strictdev
cd strictdev
cd public_website
npm start
```

## Adding NPM Modules
Make sure you are in the ngx-mono root before adding npm modules

```bash
npm install mymodule --save-dev
```

## Building an API
```
node ../../node_modules/webpack/bin/webpack.js ./src/api/entry-point.ts ./bin/output-script.js --config ../../node_modules/ngx-mono/_scripts/webpack-cli.js
```

## Starting Built API
```
node ./bin/output-script.js
```

## Ionic Development
### Building
```
node ../../node_modules/@ionic/app-scripts/bin/ionic-app-scripts.js build
```

### Serving
```
node ../../node_modules/@ionic/app-scripts/bin/ionic-app-scripts.js serve
```

### Mobile App
#### Setup
```
npm install -g cordova ionic
cordova platform add android
node ../../node_modules/@ionic/app-scripts/bin/ionic-app-scripts.js build
```

#### Compile Mobile App
```
cordova build android
```


