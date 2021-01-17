import { Agent, getAgent, getApp } from '.';
import { Application } from '@nocobase/server/src';
import { options, types } from '../interfaces';
jest.setTimeout(30000);
import { CollectionModel, FieldModel } from '../models';
import { ModelCtor, Model } from '@nocobase/database';
import _ from 'lodash';
import { Op } from 'sequelize';

describe('models.field', () => {
  let app: Application;
  let agent: Agent;
  let collection: Model;
  let Test: ModelCtor<Model>;

  async function createCollection(data) {
    const [Collection, Field] = app.database.getModels(['collections', 'fields']);
    const collection = await Collection.create(data);
    await collection.updateAssociations(data);
    return collection;
  }

  async function createTest(data: any): Promise<Model> {
    const [Test] = app.database.getModels(['tests']);
    const test = await Test.create(data);
    await test.updateAssociations(data);
    return test;
  }

  async function createField(data: any): Promise<Model> {
    const field = await collection.createField(data);
    await field.updateAssociations(data);
    return field;
  }

  function getTableField(fieldName: string) {
    const table = app.database.getTable('tests');
    return table.getField(fieldName);
  }

  function expectField(fieldName: string) {
    const field = getTableField(fieldName);
    return field;
  }

  function expectTableFieldOptions(fieldName: string, optionKey?: any) {
    const field = getTableField(fieldName);
    const options = field.getOptions();
    // console.log(options);
    return expect(optionKey ? _.get(options, optionKey) : options);
  }

  beforeEach(async () => {
    app = await getApp();
    agent = getAgent(app);
    collection = await createCollection({
      name: 'tests',
      title: 'tests',
    });
  });

  afterEach(async () => {
    // await app.database.sync();
    await app.database.close();
  });

  it('basic', async () => {
    const field = await createField({
      interface: 'string',
      title: 'string',
    });
    // 存数据库的配置
    expect(field.get()).toMatchObject(types.string.options);
    // 存 db.tables 里的配置
    expectTableFieldOptions(field.name).toMatchObject(types.string.options);
    const test = createTest({
      [field.name] : 'abc',
    });
    expect(test[field.name]).toBe('abc'); 
  });

  it('merge', async () => {
    const field = await createField({
      interface: 'string',
      title: 'string',
      component: {
        a: 'a',
        arr: [{a: 'a'}],
      },
    });
    // 额外扩展参数
    expect(field.get('component')).toMatchObject({
      type: 'string',
      a: 'a',
      arr: [{a: 'a'}],
    });
    // 更新配置参数
    await field.update({
      component: {
        b: 'b',
        arr: [{a: 'a'}, {b: 'b'}],
      }
    });
    expect(field.get('component')).toMatchObject({
      type: 'string',
      a: 'a',
      b: 'b',
      arr: [{a: 'a'}, {b: 'b'}],
    });
  });

  it('replace default', async () => {
    const field = await createField({
      interface: 'number',
      title: 'number',
      // 替换默认值
      precision: 2,
    });
    expect(field.get('precision')).toBe(2);
  });

  it('defaultValue', async () => {
    const field = await createField({
      interface: 'multipleSelect',
      title: 'multipleSelect',
    });
    expectTableFieldOptions(field.name, 'defaultValue').toEqual([]);
    await field.update({
      defaultValue: ['a'],
    });
    // 检查是否有更新
    expectTableFieldOptions(field.name, 'defaultValue').toEqual(['a']);
  });

  it('dataSource', async () => {
    const field = await createField({
      interface: 'multipleSelect',
      title: 'multipleSelect',
      dataSource: [
        {label: 'l1'},
        {label: 'l2'},
        {label: 'l3', value: 'v3'},
      ],
    });
    const len = field.get('dataSource').map(option => option.value).filter(Boolean).length;
    expect(len).toBe(3);
    expect(field.get('dataSource')[2].value).toBe('v3');
  });

  describe('linkTo', () => {
    it('linkTo2', async () => {
      const collection = await createCollection({
        title: 't1',
        fields: [
          {
            interface: 'string',
            name: 'title',
          }
        ],
      });
      const field = await createField({
        interface: 'linkTo',
        title: 'linkTo',
        target: collection.name, // 关联新增的 collection
      });
      const test = await createTest({
        [field.name]: [{
          title: 'title1',
        }, {
          title: 'title2',
        }],
      });
      const t2 = await app.database.getModel('tests').findOne({
        where: {
          id: test.id,
        },
        include: {
          association: field.name,
        }
      });
      const items = t2.get(field.name).map(model => model.get('title'));
      expect(items).toEqual(['title1', 'title2']);
    });

    it('options', async () => {
      const target = await createCollection({
        title: 'target1',
        fields: [
          {
            interface: 'string',
            name: 'title',
          }
        ],
      });
      const through = await createCollection({
        title: 'through1',
        fields: [
          {
            interface: 'string',
            name: 'title',
          }
        ],
      });
      const options = {
        interface: 'linkTo',
        title: 't1',
        target: target.name,
        sourceKey: 'id',
        targetKey: 'id',
        foreignKey: 'f_blli',
        otherKey: 'f_o43p',
        through: through.name,
      };
      const field = await createField(options);
      expect(field.get()).toMatchObject(options);
    });
  });

  describe('subTable', () => {
    it('subTable', async () => {
      const field = await createField({
        interface: 'subTable',
        title: 'subTable',
        children: [
          {
            interface: 'string',
            title: 'string',
          },
        ],
      });
      const child = await field.getChildren({
        limit: 1,
        plain: true,
      });
      const data = {
        [field.name]: [
          {
            [child.name]: 'aaa',
          },
          {
            [child.name]: 'bbb',
          },
        ]
      };
      const test = await createTest(data);
      const t2 = await app.database.getModel('tests').findOne({
        where: {
          id: test.id,
        },
        include: {
          association: field.name,
        }
      });
      expect(t2.get()).toMatchObject(data);
    });
    it('linkTo in subTable', async () => {
      const collection = await createCollection({
        title: 't1',
        fields: [
          {
            interface: 'string',
            name: 'title',
          }
        ],
      });
      const field = await createField({
        interface: 'subTable',
        title: 'subTable',
        children: [
          {
            interface: 'string',
            title: 'string',
            name: 'string',
          },
          {
            interface: 'linkTo',
            title: 'linkTo',
            target: collection.name,
            // multiple: false,
          },
        ],
      });
      const child = await field.getChildren({
        where: {
          interface: 'linkTo',
        },
        limit: 1,
        plain: true,
      });
      const test = await createTest({
        [field.name]: [
          {
            string: 's1',
            [child.name]: [
              {
                title: 't1',
              }
            ],
          },
        ],
      });
      const Test = app.database.getModel('tests');
      const t2 = await Test.findOne({
        where: {
          id: test.id,
        },
        include: [{
          association: field.name,
          include: [
            {
              association: child.name
            }
          ]
        }]
      });
      expect(t2.toJSON()).toMatchObject({
        [field.name]: [
          {
            string: 's1',
            [child.name]: [
              {
                title: 't1',
              }
            ],
          },
        ],
      });
      console.log(t2.toJSON());
    });

    it.only('linkTo in subTable', async () => {
      const collection = await createCollection({
        title: 't1',
        fields: [
          {
            interface: 'string',
            name: 'title',
          }
        ],
      });
      const field = await createField({
        interface: 'subTable',
        title: 'subTable',
        children: [
          {
            interface: 'string',
            title: 'string',
            name: 'string',
          },
          {
            interface: 'linkTo',
            title: 'linkTo',
            target: collection.name,
            multiple: false,
          },
        ],
      });
      await app.database.getModel('collections').load({
        where: {
          name: {
            [Op.in]: [
              ...app.database.getTable('tests').getRelatedTableNames()
            ]
          }
        }
      });
      const child = await field.getChildren({
        where: {
          interface: 'linkTo',
        },
        limit: 1,
        plain: true,
      });
      const Field = app.database.getModel('fields');
      const fields = await Field.findAll({
        where: {
          type: 'belongsToMany',
        }
      });
      for (const field of fields) {
        await field.migrate();
      }
      const belongsToField = await Field.findOne({
        where: {
          type: 'belongsTo',
        }
      });
      await belongsToField.migrate();
      const Test = app.database.getModel('tests');
      console.log({
        [field.name]: [
          {
            string: 'str1',
            [child.name]: {
              title: 'title1'
            },
          },
        ],
      });
      const test = await createTest({
        [field.name]: [
          {
            [child.name]: {
              title: 'title1'
            },
          },
        ],
      });
      const linkToField = await Field.findOne({
        where: {
          collection_name: 'tests',
          type: 'belongsToMany',
        }
      });
      await createTest({
        [linkToField.name]: [
          {},
        ],
      });

      console.log(field.name, belongsToField.get('collection_name'), {
        [field.name]: [
          {
            [belongsToField.name]: {},
          }
        ],
      });
      const SubModel = app.database.getModel(belongsToField.get('collection_name'));
      const sub = await SubModel.create();
      await sub.updateAssociations({
        [belongsToField.name]: {},
      });
      await createTest({
        [field.name]: [
          {
            [belongsToField.name]: {},
          }
        ],
      });
      return;
      const t2 = await Test.findOne({
        where: {
          id: test.id,
        },
        include: [{
          association: child.name,
        }]
      });
      // expect(t2.toJSON()).toMatchObject({
      //   [field.name]: [
      //     {
      //       string: 's1',
      //       [child.name]: {
      //         title: 't1',
      //       },
      //     },
      //   ],
      // });
      console.log(t2.toJSON());
    });
  })

});
