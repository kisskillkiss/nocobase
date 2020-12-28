import { col, fn, Op, Utils } from 'sequelize';
import { BELONGSTO } from '.';

function toArray(value: any): any[] {
  if (value == null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

const op = new Map<string, typeof Op | Function>();

// Sequelize 内置
for (const key in Op) {
  op.set(key, Op[key]);
  const val = Utils.underscoredIf(key, true);
  op.set(val, Op[key]);
  op.set(val.replace(/_/g, ''), Op[key]);
}

// 通用

// 是否为空：数据库意义的 null
op.set('$null', () => ({ [Op.is]: null }));
op.set('$notNull', () => ({ [Op.not]: null }));

// 字符串

// 包含：指对应字段的值包含某个子串
op.set('$includes', (value: string) => ({ [Op.iLike]: `%${value}%` }));
// 不包含：指对应字段的值不包含某个子串（慎用：性能问题）
op.set('$notIncludes', (value: string) => ({ [Op.notILike]: `%${value}%` }));
// 以之起始
op.set('$startsWith', (value: string) => ({ [Op.iLike]: `${value}%` }));
// 不以之起始
op.set('$notStartsWith', (value: string) => ({ [Op.notILike]: `${value}%` }));
// 以之结束
op.set('$endsWith', (value: string) => ({ [Op.iLike]: `%${value}` }));
// 不以之结束
op.set('$notEndsWith', (value: string) => ({ [Op.notILike]: `%${value}` }));

// 多选（JSON）类型

// 包含组中任意值（命名来源：`Array.prototype.some`）
op.set('$anyOf', (values: any[]) => ({
  [Op.or]: toArray(values).map(value => ({ [Op.contains]: value }))
}));
// 包含组中所有值
op.set('$allOf', (values: any[]) => ({ [Op.contains]: toArray(values) }));
// TODO: 不包含组中任意值
op.set('$notAnyOf', (values: any[]) => ({
  [Op.or]: toArray(values).map(value => ({ [Op.contains]: value }))
}));
// 与组中值匹配
op.set('$match', (values: any[]) => {
  const array = toArray(values);
  return {
    [Op.contains]: array,
    [Op.contained]: array
  };
});

// 关系类型
// TODO(optimize): 这里的处理函数接口类型与其他普通值的不同
// 存在
// op.set('$exists', function(value, key, { model, sourceAlias }) {
//   return this.$exists = model.database.sequelize.where(fn('count', col(sourceAlias)), Op.gt, 0);
// });
op.set('$exists', function(filter, key, { model }) {
  const table = model.database.getTable(model.name);
  const associationField = table.getField(key);
  if (associationField instanceof BELONGSTO) {
    this.where[associationField.options.foreignKey] = { [Op.not]: null };
  } else {
    this.include[key].required = true;
  }
});
// 不存在
// op.set('$notExists', function(filter, key, { model }) {
//   const table = model.database.getTable(model.name);
//   const associationField = table.getField(key);
//   if (associationField instanceof BELONGSTO) {
//     this.where[associationField.options.foreignKey] = { [Op.is]: null };
//   } else {
//     this.where[]
//   }
// });



export default op;
