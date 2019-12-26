Example application showcasing how to use expose npm packages and 
load them in a qooxdoo application using webpack and expose-loader.

I wrote it mostly to keep note for my self the walkthrough. 
Improvements, sugestions etc. are welcome.

We will use [amcharts][amcharts] as an example.

### Initialize a qooxdoo application

First create the qooxdoo application. Run

```console
  $ npx qx create charts --type desktop --namespace charts --out charts
```

and follow the instructions.

Then cd into it and initialize a npm package

```console
  $ cd charts
  $ npm init -y
```

You probably don't want to publish this project to npmjs so it is a good
idea to mark it as private. Edit the file `package.json` and add the private
key

```json
{
  "name": "charts",
  "version": "1.0.0",
  "description": "Example application showcasing how to use expose npm packages and  load them in a qooxdoo application using webpack and expose-loader.",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "private": true,
  "author": "",
  "license": "ISC"
}
```

Follow good practices. Use version control. Edit the file .gitignore and add `node_modules/ 

```shell
# .gitignore template for skeleton-based apps
/compiled
/qx_packages
.package-cache.json
/node_modules
```

```console
 $ git init
 $ git add .
 $ git commit -m "Initial commit"
```



[amcharts]: https://www.amcharts.com
