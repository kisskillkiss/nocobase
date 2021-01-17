import { Agent, getAgent, getApp } from '../';
import { Application } from '@nocobase/server/src';
import { options, types } from '../../interfaces';
jest.setTimeout(30000);
import { FieldModel } from '../../models';
describe('models.field', () => {
  let app: Application;
  let agent: Agent;

  beforeEach(async () => {
    app = await getApp();
    agent = getAgent(app);
  });

  afterEach(() => app.database.close());

  async function createCollection(data) {
    const [Collection, Field] = app.database.getModels(['collections', 'fields']);
    const collection = await Collection.create(data);
    await collection.updateAssociations(data);
    return collection;
  }

  it('updatedAt', async () => {
    const Field = app.database.getModel('fields');
    const field = new Field();
    field.setInterface('updatedAt');
    expect(field.get()).toMatchObject(types.updatedAt.options)
  });

  it('dataSource', async () => {
    const Collection = app.database.getModel('collections');
    // @ts-ignore
    const collection = await Collection.create({
      title: 'tests',
    });
    await collection.updateAssociations({
      fields: [
        {
          title: 'xx',
          name: 'xx',
          interface: 'select',
          type: 'virtual',
          dataSource: [
            {label: 'xx', value: 'xx'},
          ],
          component: {
            type: 'string',
            showInDetail: true,
            showInForm: true,
          },
        }
      ],
    });
    const fields = await collection.getFields();
    expect(fields[0].get('dataSource')).toEqual([
      {label: 'xx', value: 'xx'},
    ]);
  });

  it('subTable', async () => {
    await createCollection({
      title: 'bars',
      name: 'bars',
      fields: [
        {
          interface: 'subTable',
          title: '子表格',
          // name: 'subs',
          children: [
            {
              interface: 'string',
              title: '子字段1',
              // name: 'name',
            },
          ],
        },
      ],
    });
  });

  it('subTable with linkTo', async () => {
    await createCollection({
      title: 'foos',
      name: 'foos',
      fields: [
        {
          interface: 'string',
          title: '标题1'
        },
      ],
    });
    await createCollection({
      title: 'bars',
      name: 'bars',
      fields: [
        {
          interface: 'subTable',
          title: '子表格',
          // name: 'subs',
          children: [
            {
              interface: 'string',
              title: '子字段1',
              // name: 'name',
            },
            {
              interface: 'linkTo',
              title: '关联1',
              target: 'foos',
            },
          ],
        },
      ],
    });
  });

  it.only('subTable with linkTo multiple = false(A.B + B.C = A.C)', async () => {
    await createCollection({
      title: 'foos',
      name: 'foos',
      fields: [
        {
          interface: 'string',
          title: '标题1'
        },
      ],
    });
    await createCollection({
      title: 'bars',
      name: 'bars',
      fields: [
        {
          interface: 'subTable',
          title: '子表格',
          // name: 'subs',
          children: [
            {
              interface: 'string',
              title: '子字段1',
              // name: 'name',
            },
            {
              interface: 'linkTo',
              title: '关联1',
              target: 'foos',
              multiple: false,
            },
          ],
        },
      ],
    });
  });
});
