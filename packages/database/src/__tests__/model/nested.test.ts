import fields from 'packages/database/examples/plugins/db-driven/tables/fields';
import { getDatabase } from '..';
import Database from '../..';

let db: Database;

beforeEach(async () => {
  db = getDatabase();
  db.sync();
});

afterEach(async () => {
  await db.close();
});

describe('nested', () => {
  it.only('a', async () => {
    const sync = false;
    const barTable = db.table({
      name: 'bars',
      fields: [
        {
          name: 'title',
          type: 'string',
        }
      ]
    });
    sync && await barTable.sync({
      force: false,
      alter: {
        drop: false,
      }
    });
    const testTable = db.table({
      name: 'tests',
    });
    sync && await testTable.sync({
      force: false,
      alter: {
        drop: false,
      }
    });
    const subTable = db.table({
      name: 'subs',
      // fields: [{
      //   type: 'integer',
      //   primaryKey: true,
      //   autoIncrement: true,
      //   name: 'id',
      // }]
    });
    sync && await subTable.sync({
      force: false,
      alter: {
        drop: false,
      }
    });
    testTable.addField({
      target: 'subs',
      sourceKey: 'id',
      foreignKey: 'test_id',
      type: 'hasMany',
      name: 'f_9izm',
    });
    sync && await testTable.sync({
      force: false,
      alter: {
        drop: false,
      }
    });
    subTable.addField({
      name: 'string',
      type: 'string',
    });
    sync && await subTable.sync({
      force: false,
      alter: {
        drop: false,
      }
    });
    testTable.addField({
      target: 'bars',
      through: 'subs',
      otherKey: 'bar_id',
      sourceKey: 'id',
      targetKey: 'id',
      foreignKey: 'test_id',
      type: 'belongsToMany',
      name: 'f_s56p',
    });
    sync && await testTable.sync({
      force: false,
      alter: {
        drop: false,
      }
    });
    barTable.addField({
      target: 'tests',
      through: 'subs',
      otherKey: 'test_id',
      sourceKey: 'id',
      targetKey: 'id',
      foreignKey: 'bar_id',
      type: 'belongsToMany',
      name: 'f_qwmq',
    });
    sync && await barTable.sync({
      force: false,
      alter: {
        drop: false,
      }
    });
    subTable.addField( {
      target: 'bars',
      targetKey: 'id',
      foreignKey: 'bar_id',
      type: 'belongsTo',
      name: 'bar',
    });
    sync && await subTable.sync({
      force: false,
      alter: {
        drop: false,
      }
    });
    testTable.addField({
      target: 'subs',
      sourceKey: 'id',
      foreignKey: 'test_id',
      type: 'hasMany',
      name: 'f_9izm',
    });
    await testTable.sync({
      force: false,
      // alter: {
      //   drop: false,
      // }
    });
    // await db.sync({
    //   tables: ['bars', 'tests', 'subs']
    // });
    const Test = db.getModel('tests');
    const test = await Test.create();
    await test.updateAssociations({
      f_9izm: [{
        string: 'string',
        bar: {},
      }],
    });
  });
});
