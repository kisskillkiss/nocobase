import FieldModel, { generateFieldName, generateValueName } from '../models/field';
import _ from 'lodash';
import * as types from '../interfaces/types';
import { merge } from '../utils';
import { generateCollectionName } from '../models';
import { SaveOptions, Utils } from 'sequelize';

export async function fieldBeforeValidate(model: FieldModel, opts) {
  const original = model.get();
  const { collection_name, parent_id, dataSource, interface: interfaceType } = original;
  // 没有 interface 参数不处理
  if (!interfaceType) {
    return;
  }
  const { options } = types[interfaceType];
  const data: any = merge(options, original);
  // console.log({data});
  let parentField;
  // 子表格字段，collection_name 为父字段的 target
  if (!collection_name && parent_id) {
    const parent = await model.getParent({
      ...opts,
    });
    const target = parent.get('target');
    if (target && parent.get('type') === 'hasMany') {
      data.collection_name = target;
      parentField = parent;
      // model.set('collection_name', target);
    }
  }

  if (Array.isArray(data.dataSource)) {
    data.dataSource = dataSource.map(item => {
      if (!item.value) {
        item.value = generateValueName();
      }
      return {...item};
    });
  }

  // linkTo 时，如果原始数据 type 未提供，不允许关联多条记录时，type 默认为 belongsTo
  let isBelongsTo: boolean;
  if (parentField && interfaceType === 'linkTo' && !original.type && !data.multiple) {
    data.type = 'belongsTo'; // 暂时只在 subTable 的子字段里的 linkTo 才更改 type
    isBelongsTo = true;
  }

  const [Collection, Field] = model.database.getModels(['collections', 'fields']);
  if (['hasOne', 'hasMany', 'belongsTo', 'belongsToMany'].includes(data.type)) {
    // name 为空时，其他参数都自动生成（可以确定）
    if (!data.name) {
      data.name = generateFieldName();
      // 配置子表格时，target 不存在，需要创建 target 表
      if (!data.target) {
        data.target = generateCollectionName();
        await Collection.create({
          title: data.title || data.name,
          name: data.target,
          internal: true, // 内置表，开发者模式
          developerMode: true,
        }, opts);
      }
      // 通用，外键，四种关系都有
      if (!data.foreignKey) {
        data.foreignKey = generateFieldName();
      }
      // 多对多关联
      if (data.type === 'belongsToMany') {
        if (!data.through) {
          data.through = generateCollectionName();
        }
        if (!data.otherKey) {
          data.otherKey = generateFieldName();
        }
      }
    } else {
      // name 不为空的情况
      // 只有 name，没有 target，target 等相关参数根据 name 生成（可以确定，用于代码配置）
      if (!data.target) {
        data.target = ['hasOne', 'belongsTo'].includes(data.type) ? Utils.pluralize(data.name) : data.name;
      }
      // TODO: 同时提供 name 和 target 可能是开发者模式，也可能代码配置，相关参数暂时没法配置
    }
    // const SourceModel = model.database.getModel(model.constructor.name);
    if (data.type !== 'belongsTo' && !data.sourceKey) {
      // @ts-ignore
      data.sourceKey = model.constructor.primaryKeyAttribute;
    }
    // 如果 target table 存在，处理 targetKey 的情况（TODO: 需要处理不存在的情况）
    if (model.database.isDefined(data.target)) {
      const TargetModel = model.database.getModel(data.target);
      if (['belongsTo', 'belongsToMany'].includes(data.type) && !data.targetKey) {
        data.targetKey = TargetModel.primaryKeyAttribute;
      }
    }
    if (isBelongsTo && parentField) {
      const source = parentField.get('collection_name');
      const sourceForeignKey = parentField.get('foreignKey');
      const [S, T] = model.database.getModels([
        source,
        data.target,
      ]);
      const f1 = Field.build({
        interface: 'linkTo',
        // @ts-ignore
        title: T.options.title,
        target: data.target,
        sourceKey: S.primaryKeyAttribute,
        targetKey: T.primaryKeyAttribute,
        foreignKey: sourceForeignKey,
        otherKey: data.foreignKey,
        through: data.collection_name,
        collection_name: source,
      }, opts);
      await fieldBeforeValidate(f1 as FieldModel, opts);
      await f1.save();
      const f2 = Field.build({
        interface: 'linkTo',
        // @ts-ignore
        title: S.options.title,
        target: source,
        sourceKey: T.primaryKeyAttribute,
        targetKey: S.primaryKeyAttribute,
        foreignKey: data.foreignKey,
        otherKey: sourceForeignKey,
        through: data.collection_name,
        collection_name: data.target,
      }, opts);
      await fieldBeforeValidate(f2 as FieldModel, opts);
      await f2.save();
      // console.log({f1: f1.get(),f2: f2.get()});
    }
  }
  if (!data.name) {
    data.name = generateFieldName();
  }
  // console.log(data);
  model.set(data);
}

export default fieldBeforeValidate;
