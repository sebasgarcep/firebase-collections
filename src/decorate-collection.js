'use strict';

/* eslint-disable no-param-reassign */

const utilcase = require('case');
const pluralize = require('pluralize');

module.exports = (app, Collection, _prefix = '') => {
  const internal = {};
  Collection._internal = internal;

  // firebase instances
  internal.app = app;
  internal.admin = app.firebase.admin;

  // name of the class itself
  internal.modelName = Collection.name;
  internal.pluralModelName = pluralize(internal.modelName);

  // name of the reference in the database
  internal.storeName = utilcase.camel(Collection.name);
  internal.pluralStoreName = pluralize(internal.storeName);

  // collection static methods
  Collection.getReference = (prefix = _prefix) => {
    return internal.admin.database().ref(`${prefix}/${internal.pluralStoreName}`);
  };

  Collection.getReferenceById = (id, prefix = _prefix) => {
    return Collection.getReference(prefix).child(id);
  };

  Collection.find = async (id, prefix = _prefix) => {
    let instance = null;

    const ref = Collection.getReferenceById(id, prefix);
    const data = await ref.once('value').then(instance.fromDataSnapshot);

    if (data !== null) {
      instance = new Collection();
      instance.fill(data);
    }

    return instance;
  };

  Collection.findBy = async (key, value, prefix = _prefix) => {
    let instance = null;

    let ref;
    ref = Collection.getReference(prefix);
    ref = ref.orderByChild(key);
    ref = ref.equalTo(value);
    ref = ref.limitToFirst(1);

    const snapshot = await ref.once('value');
    snapshot.forEach((child) => {
      const data = instance.fromDataSnapshot(child);

      if (data !== null) {
        instance = new Collection();
        instance.fill(data);
      }

      return true;
    });

    return instance;
  };

  Collection.paginate = async (startAfter = null, pageSize = 10, prefix = _prefix) => {
    let skip = !!startAfter;
    const offset = skip ? 1 : 0;

    let ref;
    ref = Collection.getReference(prefix);
    if (startAfter !== null) ref = ref.startAt(startAfter);
    if (pageSize !== null) ref = ref.limitToFirst(pageSize + offset);

    const entities = [];
    const snapshot = await ref.once('value');
    snapshot.forEach((child) => {
      if (skip) {
        skip = false;
        return;
      }

      const instance = new Collection();
      const data = instance.fromDataSnapshot(child);
      instance.fill(data);

      entities.push(instance);
    });
  };

  Collection.all = (prefix = _prefix) => {
    return Collection.paginate(null, null, prefix);
  };
};
