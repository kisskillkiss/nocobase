import { Utils } from 'sequelize';
import Model, { ModelCtor } from './model';
import _ from 'lodash';
import op from './op';
import { BELONGSTO } from './fields/field-types';

interface ToWhereContext {
  model?: ModelCtor<Model> | Model | typeof Model;
  associations?: any;
  dialect?: string;
  ctx?: any;
}

export function toWhere(filter: any, context: ToWhereContext = {}) {
  if (filter === null || typeof filter !== 'object') {
    return filter;
  }
  if (Array.isArray(filter)) {
    return filter.map((item) => toWhere(item, context));
  }
  const { model, associations = {}, ctx, dialect } = context;
  const items = {};
  // 先处理「点号」的问题
  for (const key in filter) {
    _.set(items, key, filter[key]);
  }
  const queryOptions = { where: {}, include: {}, scopes: [] };
  for (const key in items) {
    const association = associations[key];
    console.log(key);
    if (association) {
      const { $exists, $notExists, ...conditions } = items[key];
      if (Object.keys(conditions).length || !(association instanceof BELONGSTO)) {
        queryOptions.include[key] = toWhere(conditions, {
          ...context,
          model: association.target,
          associations: association.target.associations,
        });
      }
      if (typeof $exists !== 'undefined') {
        const fn = op.get('$exists') as Function;
        fn.call(queryOptions, items, key, context);
      }
      // if (typeof $notExists !== 'undefined') {
      //   const fn = op.get('$notExists') as Function;
      //   Object.assign(queryOptions, fn(association));
      // }
    }
    else if (model && model.options.scopes && model.options.scopes[key]) {
      const scope = model.options.scopes[key];
      if (typeof scope === 'function') {
        queryOptions.scopes.push({ method: [key, items[key], ctx] });
      } else {
        queryOptions.scopes.push(key);
      }
    }
    else {
      // TODO: to fix same op key as field name
      const opKey = op.get(key);
      let k;
      switch (typeof opKey) {
        case 'function':
          Object.assign(queryOptions, opKey(items[key]));
          continue;
        case 'undefined':
          k = key;
          break;
        default:
          k = opKey;
          break;
      }
      // TODO(optimize): 此处无法支持 not 替代当前 key 的反向逻辑
      queryOptions.where[k] = toWhere(items[key], context);
    }
  }
  return queryOptions;
}

interface ToIncludeContext {
  model?: ModelCtor<Model> | Model | typeof Model;
  sourceAlias?: string;
  associations?: any;
  dialect?: string;
  ctx?: any
}

export function toOrder(sort: string | string[], model: any): string[][] {
  if (sort && typeof sort === 'string') {
    sort = sort.split(',');
  }

  const order = [];

  if (Array.isArray(sort) && sort.length > 0) {
    sort.forEach(key => {
      if (Array.isArray(key)) {
        order.push(key);
      } else {
        const direction = key[0] === '-' ? 'DESC' : 'ASC';
        const keys = key.replace(/^-/, '').split('.');
        const field = keys.pop();
        const by = [];
        let associationModel = model;
        for (let i = 0; i < keys.length; i++) {
          const association = model.associations[keys[i]];
          if (association && association.target) {
            associationModel = association.target;
            by.push(associationModel);
          }
        }
        order.push([...by, field, direction]);
      }
    });
  }

  return order;
}

export function toInclude(options: any, context: ToIncludeContext = {}) {
  function makeFields(key: string) {
    if (!Array.isArray(items[key])) {
      return;
    }
    items[key].forEach(field => {
      // 按点分隔转化为数组
      const [col, ...arr]: string[] = Array.isArray(field) ? Utils.cloneDeep(field) : field.split('.');
      // 内嵌的情况
      if (arr.length > 0) {
        if (!children.has(col)) {
          children.set(col, {
            fields: {
              only: [],
              except: [],
              appends: [],
            },
          });
        }
        children.get(col).fields[key].push(arr);
        return;
      }
      if (key !== 'except') {
        // 关系字段
        if (associations[col]) {
          const includeItem: any = {
            association: col,
          };
          if (includeOptions[col]) {
            Object.assign(includeItem, includeOptions[col]);
          }
          include.set(col, includeItem);
          return;
        }
        // 计数字段
        const matches: Array<any> = col.match(/(.+)_count$/);
        if (matches && associations[matches[1]]) {
          attributes[key].push(model.withCountAttribute({
            association: matches[1],
            sourceAlias: sourceAlias
          }));
          return;
        }
      } else {
        if (!attributes.except) {
          attributes.except = [];
        }
      }
      attributes[key].push(col);
    });
  }

  const { fields = [], filter } = options;
  const { model, sourceAlias, associations = {}, ctx, dialect } = context;

  let where = options.where || {};
  let includeOptions = {};
  let scopes = [];

  if (filter) {
    const whereOptions = toWhere(filter, {
      model,
      associations,
      ctx,
    }) || {};
    where = whereOptions.where;
    if (whereOptions.include) {
      includeOptions = Utils.cloneDeep(whereOptions.include);
    }
    if (whereOptions.scopes) {
      scopes = Utils.cloneDeep(whereOptions.scopes);
    }
  }

  const attributes = {
    only: [],
    except: [],
    appends: [],
  };

  const include = new Map();
  const children = new Map();

  const items = Array.isArray(fields) ? { only: fields } : fields;
  items.appends = items.appends || [];
  
  makeFields('only');
  makeFields('appends');
  makeFields('except');

  for (const key in includeOptions) {
    if (children.has(key)) {
      Object.assign(children.get(key), includeOptions[key]);
    } else {
      children.set(key, {
        association: key,
        fields: [],
        ...includeOptions[key],
      });
    }
  }

  for (const [key, child] of children) {
    const result = toInclude(child, {
      ...context,
      model: associations[key].target,
      sourceAlias: key,
      associations: associations[key].target.associations,
    });
    const item: any = {
      association: key,
    }
    if (result.attributes) {
      item.attributes = result.attributes;
    }
    if (result.include) {
      item.include = result.include;
    }
    if (result.where) {
      item.where = result.where;
    }
    if (result.scopes) {
      item.model = associations[key].target.scope(result.scopes);
    }
    // 解决同时有关联和关联的子级关联时，关联的 attribute 被设置为空数组的问题
    // ['user.profile.age', 'user.status', 'user', 'title', 'status']
    if (include.has(key) && Array.isArray(item.attributes) && !item.attributes.length) {
      delete item.attributes;
    }
    include.set(key, item);
  }

  const data: any = {};

  // 存在黑名单时
  if (attributes.except.length) {
    data.attributes = {
      exclude: attributes.except,
    };
    if (attributes.appends.length) {
      data.attributes.include = attributes.appends;
    }
  }
  // 存在白名单时
  else if (attributes.only.length) {
    data.attributes = [...attributes.only, ...attributes.appends];
  }
  // 只有附加字段时
  else if (attributes.appends.length) {
    data.attributes = {
      include: attributes.appends,
    };
  }

  if (include.size) {
    if (!data.attributes) {
      data.attributes = [];
    }
    data.include = Array.from(include.values());
    data.distinct = true;
  }

  if (Reflect.ownKeys(where).length) {
    data.where = where;
  }

  if (scopes.length) {
    data.scopes = scopes;
  }

  const order = toOrder(options.sort, model);

  if (order.length) {
    data.order = order;
  }

  return data;
}

export function whereCompare(a: any, b: any): boolean {
  return _.isEqual(a, b);
}

export function requireModule(module: any) {
  if (typeof module === 'string') {
    module = require(module);
  }
  if (typeof module !== 'object') {
    return module;
  }
  return module.__esModule ? module.default : module;
}

export function isNumber(num) {
  if (typeof num === 'number') {
    return num - num === 0;
  }
  if (typeof num === 'string' && num.trim() !== '') {
    return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
  }
  return false;
};
