'use strict';

const { AdminRoot, defaultConfig } = require('firebase-admin-mock');
const { Collection, registerCollections } = require('../src');

let app;
describe('Collection testing suite', () => {
  beforeEach(() => {
    const admin = new AdminRoot();
    admin.initializeApp(defaultConfig);

    app = {
      decorate: (key, value) => {
        app[key] = value;
      },

      plugin: (ext) => {
        ext(app);
      },

      firebase: {
        admin,
      },
    };

    class User extends Collection {}

    const collections = {
      User,
    };

    const ext = registerCollections(collections);

    app.plugin(ext);
  });

  it('should not throw an error', async () => {
    const { User } = app.collections;
    const user = new User();
    user.email = 'a@b.com';
    await user.save();
    await user.delete();
    console.log(user);
    console.log(app.firebase.admin.database().getMockData());
  });
});
