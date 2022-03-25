import { Database } from '../../database';
import { mockDatabase } from '../';
import { SortField } from '../../fields';

describe('string field', () => {
  let db: Database;

  beforeEach(() => {
    db = mockDatabase();
    db.registerFieldTypes({
      sort: SortField
    });
  });

  afterEach(async () => {
    await db.close();
  });

  it('sort', async () => {
    const Test = db.collection({
      name: 'tests',
      fields: [
        { type: 'sort', name: 'sort' },
      ],
    });
    await db.sync();
    const test1 = await Test.model.create<any>();
    expect(test1.sort).toBe(1);
    const test2 = await Test.model.create<any>();
    expect(test2.sort).toBe(2);
    const test3 = await Test.model.create<any>();
    expect(test3.sort).toBe(3);
  });

  it('skip if sort value not empty', async () => {
    const Test = db.collection({
      name: 'tests',
      fields: [
        { type: 'sort', name: 'sort' },
      ],
    });
    await db.sync();
    const test1 = await Test.model.create<any>({ sort: 3 });
    expect(test1.sort).toBe(3);
    const test2 = await Test.model.create<any>();
    expect(test2.sort).toBe(4);
    const test3 = await Test.model.create<any>();
    expect(test3.sort).toBe(5);
  });

  it('scopeKey', async () => {
    const Test = db.collection({
      name: 'tests',
      fields: [
        { type: 'sort', name: 'sort', scopeKey: 'status' },
        { type: 'string', name: 'status' },
      ],
    });
    await db.sync();
    const t1 = await Test.model.create({ status: 'publish' });
    const t2 = await Test.model.create({ status: 'publish' });
    const t3 = await Test.model.create({ status: 'draft' });
    const t4 = await Test.model.create({ status: 'draft' });
    expect(t1.get('sort')).toBe(1);
    expect(t2.get('sort')).toBe(2);
    expect(t3.get('sort')).toBe(1);
    expect(t4.get('sort')).toBe(2);
  });

});
