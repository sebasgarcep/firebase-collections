'use strict';

/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */

const decorateCollection = require('./decorate-collection');

module.exports = collections => (app) => {
  app.decorate('collections', collections);

  for (const collectionName in collections) {
    const Collection = collections[collectionName];
    decorateCollection(app, Collection);
  }
};
