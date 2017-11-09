'use strict';

/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable guard-for-in */

const Relationship = require('./relationship');
const decorateCollection = require('./decorate-collection');

const proxyHandler = {
  get: (target, name) => {
    const value = target[name];

    let returnReal = false;
    returnReal = returnReal || typeof value === 'function';
    returnReal = returnReal || name === 'constructor';
    returnReal = returnReal || name === '_internal';
    returnReal = returnReal || name === '_prefix';
    returnReal = returnReal || name === '_data';

    if (returnReal) {
      return value;
    }

    return target._data[name];
  },

  set: (target, name, value) => {
    if (name === '_data') {
      target[name] = value;
    } else {
      target._data[name] = value;
    }

    return value;
  },
};

module.exports = class Collection {
  constructor(prefix = '') {
    this._prefix = prefix;
    this._internal = this.constructor._internal;
    this._data = {};

    for (const propname in this) {
      const value = this[propname];
      const subprefix = `${this._prefix}/${propname}`;

      let shouldPrefix = false;
      shouldPrefix = shouldPrefix || value instanceof Relationship;
      shouldPrefix = shouldPrefix || value instanceof Collection;

      if (shouldPrefix) {
        value._prefix = subprefix;
      } else if (Object.isPrototypeOf.call(Collection, value)) {
        decorateCollection(this._internal.app, value, subprefix);
      }
    }

    this._proxy = new Proxy(this, proxyHandler);

    return this._proxy;
  }

  fromDataSnapshot = (snapshot) => {
    return snapshot.val();
  }

  fill = (data) => {
    this._data = {};
    this.merge(data);
    return this._proxy;
  }

  merge = (data) => {
    Object.assign(this._proxy, data);
    return this._proxy;
  }

  save = async () => {
    const ParentCollection = this.constructor;

    if (!this._proxy.id) {
      this._proxy.id = ParentCollection.getReference(this._proxy._prefix).push().key;
    }

    if (!this._proxy.createdAt) {
      this._proxy.createdAt = (new Date()).getTime();
    }

    this._proxy.updatedAt = (new Date()).getTime();

    const data = this._proxy.toJSON();
    await ParentCollection.getReferenceById(this._proxy.id, this._proxy._prefix)
      .update(data);

    return this._proxy;
  }

  delete = async () => {
    if (this._proxy.id) {
      const ParentCollection = this.constructor;
      await ParentCollection.getReferenceById(this._proxy.id, this._proxy._prefix).set(null);
    }
    return this._proxy;
  }

  hasOne = (collectionName) => {
    const Subcollection = this._internal.app.collections[collectionName];
    const instance = new Subcollection();
    return () => instance;
  }

  hasMany = (collectionName) => {
    const Subcollection = this._internal.app.collections[collectionName];
    const Extcollection = class extends Subcollection {};
    Extcollection.name = Subcollection.name;
    return () => Extcollection;
  }

  relatesTo = (collectionName, relationshipName) => {
    const ParentCollection = this.constructor;
    const RecipientCollection = this._internal.app.collections[collectionName];
    const relationship = new Relationship(
      this._proxy,
      ParentCollection,
      RecipientCollection,
      relationshipName,
    );
    return () => relationship;
  }

  toJSON = () => {
    return this._proxy._data;
  }
};
