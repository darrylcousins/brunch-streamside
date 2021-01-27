# Streamside

Browser app to manage vege boxes and orders for [Streamside Organics](https://streamsideorganics.co.nz).

## Getting started

* Install:
    * [Node.js](http://nodejs.org)
    * `npm install`
* Run:
    * `npm run start` — watches the project with continuous rebuild. This will also launch HTTP server on port 3334
    * `npm run docs` — build documentation
    * `npm run build` — builds minified project for production (currently only running in developement mode)

## Current environment

Using [Nginx](http://nginx.com) for http authentication and coarse routing to the app, webhooks, and code documentation.

## Dependencies

The core important dependencies installed are:

* [Brunch](http://brunch.io): Build management
* [Express](https://expressjs.com/): Server
* [MongoDB](https://www.mongodb.com/): NoSQL document database
* [@bikeshaving/crank](https://crank.js.org/): JSX-driven DOM components with functions, promises and generators
* [Crossroads](http://millermedeiros.github.com/crossroads.js/): URL routing
* [Prettier](https://prettier.io/): Opinionated code formatter
* [Eslint](https://eslint.org/): Code analysis linter
* [JsDocs](https://jsdoc.app/index.html): Code documentation
* [Tachyons](https://tachyons.io/): CSS framework
