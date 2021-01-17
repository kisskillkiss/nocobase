import fields from 'packages/database/examples/plugins/db-driven/tables/fields';
import { getDatabase } from '..';
import Database from '../..';

let db: Database;

beforeEach(async () => {
  db = getDatabase();
  db.table({
    name: 'users',
    fields: [
      {
        type: 'hasMany',
        name: 'posts',
      },
      {
        type: 'hasOne',
        name: 'profile',
      }
    ],
  });
  db.table({
    name: 'profiles',
  });
  db.table({
    name: 'categories',
  });
  db.table({
    name: 'posts',
    fields: [
      {
        type: 'string',
        name: 'title',
      },
      {
        type: 'hasMany',
        name: 'comments',
      },
      {
        type: 'belongsTo',
        name: 'user',
      },
      {
        type: 'belongsTo',
        name: 'category',
      },
      {
        type: 'belongsToMany',
        name: 'tags',
      }
    ],
  });
  db.table({
    name: 'tags',
    fields: [
      {
        type: 'belongsToMany',
        name: 'posts',
      }
    ]
  });
  db.table({
    name: 'comments',
    fields: [
      {
        type: 'string',
        name: 'content',
      },
      {
        type: 'belongsTo',
        name: 'post',
      },
    ]
  });
  await db.sync();
});

afterEach(async () => {
  await db.close();
});

describe('updateAssociations', () => {
  describe('set null', () => {
    it('belongsTo', async () => {
      const [User, Post] = db.getModels(['users', 'posts']);
      const user = await User.create();
      const post = await Post.create();
      await post.updateAssociations({
        user,
      });
      await post.updateAssociations({});
      const postUser = await post.getUser();
      expect(postUser.id).toBe(user.id);
      await post.updateAssociations({
        user: null,
      });
      expect(await post.getUser()).toBeNull();
    });

    it('hasMany', async () => {
      const [User, Post] = db.getModels(['users', 'posts']);
      const user = await User.create();
      const post = await Post.create();
      await user.updateAssociations({
        posts: [post],
      });
      expect(await user.countPosts()).toBe(1);
      await user.updateAssociations({
        posts: [], // 空数组
      });
      expect(await user.countPosts()).toBe(0);
      await user.updateAssociations({
        posts: [post],
      });
      expect(await user.countPosts()).toBe(1);
      await user.updateAssociations({
        posts: null,
      });
      expect(await user.countPosts()).toBe(0);
    });
  });
  describe('nested', () => {
    it.skip('nested', async () => {
      const productTable = db.table({
        name: 'products',
        fields: [
        ],
      });
      const orderTable = db.table({
        name: 'orders',
        fields: [
          
        ],
      });
      const detailTable = db.table({
        name: 'order_details',
        fields: [
          {
            type: 'integer',
            primaryKey: true,
            autoIncrement: true,
            name: 'id',
          },
        ],
      });
      await db.sync();
      orderTable.addField({
        type: 'belongsToMany',
        name: 'products',
        through: 'order_details',
      });
      await orderTable.sync();
      productTable.addField({
        type: 'belongsToMany',
        name: 'orders',
        through: 'order_details',
      });
      await productTable.sync();
      detailTable.addField({
        type: 'belongsTo',
        name: 'product',
        target: 'products',
      });
      await detailTable.sync();
      orderTable.addField({
        type: 'hasMany',
        name: 'details',
        target: 'order_details',
      });
      await orderTable.sync();

      detailTable.addField({
        type: 'string',
        name: 'name',
      });

      orderTable.addField({
        type: 'belongsToMany',
        name: 'products',
        through: 'order_details',
      });

      productTable.addField({
        type: 'belongsToMany',
        name: 'orders',
        through: 'order_details',
      });

      detailTable.addField({
        type: 'string',
        name: 'name2',
      });

      await db.sync();

      const Order = db.getModel('orders');
      const order = await Order.create();
      await order.updateAssociations({
        products: [
          {}
        ],
      });
      console.log(Order.associations);

      return;

      // const Order = db.getModel('orders');
      // const order = await Order.create();
      await order.updateAssociations({
        details: [
          {
            product: {}
          }
        ],
      });
      // const User = db.getModel('users');
      // const user = await User.create();
      // await user.updateAssociations({
      //   posts: [
      //     {
      //       title: 'title1',
      //       category: {},
      //       comments: [
      //         {
      //           content: 'content1',
      //         }
      //       ],
      //     },
      //   ],
      // });
    });

    it.skip('a', async () => {
      const linkToTable = db.table({
        name: 'bars',
        fields: [
          {
            name: 'title',
            type: 'string',
          }
        ]
      });
      await linkToTable.sync();
      const testTable = db.table({
        name: 'tests',
      });
      await testTable.sync();
      const subTable = db.table({
        name: 'subs',
        // fields: [{
        //   type: 'integer',
        //   primaryKey: true,
        //   autoIncrement: true,
        //   name: 'id',
        // }]
      });
      await subTable.sync();
      testTable.addField({
        target: 'subs',
        sourceKey: 'id',
        foreignKey: 'f_790s',
        type: 'hasMany',
        name: 'f_9izm',
      });
      await testTable.sync({
        force: false,
        alter: {
          drop: false,
        }
      });
      subTable.addField({
        name: 'string',
        type: 'string',
      });
      await subTable.sync({
        force: false,
        alter: {
          drop: false,
        }
      });
      testTable.addField({
        target: 'bars',
        through: 'subs',
        otherKey: 'f_u3x6',
        sourceKey: 'id',
        targetKey: 'id',
        foreignKey: 'f_790s',
        type: 'belongsToMany',
        name: 'f_s56p',
      });
      await testTable.sync({
        force: false,
        alter: {
          drop: false,
        }
      });
      linkToTable.addField({
        target: 'tests',
        through: 'subs',
        otherKey: 'f_790s',
        sourceKey: 'id',
        targetKey: 'id',
        foreignKey: 'f_u3x6',
        type: 'belongsToMany',
        name: 'f_qwmq',
      });
      await linkToTable.sync({
        force: false,
        alter: {
          drop: false,
        }
      });
      subTable.addField( {
        target: 'bars',
        targetKey: 'id',
        foreignKey: 'f_u3x6',
        type: 'belongsTo',
        name: 'f_v8ta',
      });
      await subTable.sync({
        force: false,
        alter: {
          drop: false,
        }
      });
      testTable.addField({
        target: 'subs',
        sourceKey: 'id',
        foreignKey: 'f_790s',
        type: 'hasMany',
        name: 'f_9izm',
      });
      await testTable.sync({
        force: false,
        alter: {
          drop: false,
        }
      });
      // await db.sync({
      //   tables: ['bars', 'tests', 'subs']
      // });
      const Test = db.getModel('tests');
      const test = await Test.create();
      await test.updateAssociations({
        f_9izm: [{
          string: 'string',
          f_v8ta: {},
        }],
      });
    });
  });
});

