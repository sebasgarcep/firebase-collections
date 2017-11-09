'use strict';

module.exports = class Relationship {
  constructor(target, ParentCollection, RecipientCollection, relationshipName = null) {
    this._admin = ParentCollection._internal.admin;
    this._target = target;
    this._RecipientCollection = RecipientCollection;
    this._tableName = relationshipName ||
      `${ParentCollection._internal.pluralStoreName}${RecipientCollection._internal.pluralModelName}`;
  }

  associate = async (instance) => {
    await this._admin.database()
      .ref(`${this._tableName}/${this._target.id}/${instance.id}`)
      .set(true);
  }

  dissociate = async (instance) => {
    await this._admin.database()
      .ref(`${this._tableName}/${this._target.id}/${instance.id}`)
      .set(null);
  }

  fetch = async () => {
    const snapshot = await this._admin.database()
      .ref(`${this._tableName}/${this._target.id}`)
      .once('value');

    const keys = [];
    snapshot.forEach((child) => {
      keys.push(child.key);
    });

    return Promise.all(keys.map(this._RecipientCollection.find));
  }
};
