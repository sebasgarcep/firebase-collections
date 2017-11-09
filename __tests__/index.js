'use strict';

const firebaseDeepUpdates = require('../lib');

describe('firebase deep updates testing suite', () => {
  it('should not throw an error', async () => {
    class Project extends Collection {}
    class Profile extends Collection {}

    class Post extends Collection {
      author = this.relatesTo('User')
    }

    class User extends Collection {
      profile = this.hasOne('Profile')
      projects = this.hasMany('Project')
      friends = this.relatesTo('User', 'friends')
      posts = this.relatesTo('Post')

      static fromDataSnapshot = (snapshot) => {
        return snapshot.val();
      }
    }

    const plugin = registerCollections({
      Project,
      Profile,
      Post,
      User,
    });

    app.use(plugin);

    const { User } = app.collections;
    await User.all();
    await User.find(id);
    await User.findBy(key, value);
    await User.paginate();

    const user = new User();
    user.fill({ name: 'user' });
    user.merge({ name: 'user' });

    await user.save();
    await user.delete();

    await user.profile().fetch();
    await user.projects().fetch();
    await user.projects().find(id).fetch();
    await user.posts().fetch();

    const post = new Post();
    await user.posts().associate(post);
    await post.author().associate(user);

    const dataModel = {
      users: {
        ...,
        profile: { ... },
        projects: {
          [id1]: { ... },
        },
      },

      posts: {

      },

      friends: {
        [id1]: {
          [id2]: true
        }
      }

      usersPosts: {
        [id1]: {
          [id2]: true
        }
      },

      postsUsers: {
        [id1]: {
          [id2]: true
        }
      }
    };
  });
});
