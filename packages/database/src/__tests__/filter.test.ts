import { getDatabase } from '.';
import Database, { Field } from '../';
import Table from '../table';

let db: Database;

beforeEach(async () => {
  db = getDatabase();
  db.table({
    name: 'foos',
    fields: [
      {
        type: 'belongsToMany',
        name: 'f_d3ah',
        target: 'bars',
        through: 'bars_foos',
        sourceKey: 'id',
        targetKey: 'id',
        foreignKey: 'f_ld93',
        otherKey: 'f_pie9',
      },
      {
        type: 'string',
        name: 'name',
      }
    ],
  });
  db.table({
    name: 'bars',
    fields: [
      {
        type: 'belongsToMany',
        name: 'f_ca6c',
        target: 'foos',
        through: 'bars_foos',
        sourceKey: 'id',
        targetKey: 'id',
        foreignKey: 'f_pie9',
        otherKey: 'f_ld93',
      },
      {
        type: 'string',
        name: 'name',
      }
    ],
  });
  await db.sync();
});

afterEach(async () => {
  await db.close();
});

describe('filter', () => {
  it.only('logical filter', async () => {
    const Foo = db.getModel('foos');
    const options = Foo.parseApiJson({
      filter: {
        and: [
          {
            'f_d3ah.name': 'aaa'
          }
        ],
      },
    });
    const foos = await Foo.findAll(options);
  });
});
