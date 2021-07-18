import { SchemaRenderer } from '@nocobase/client/lib';
import React from 'react';

export default () => {
  const schema = {
    type: 'array',
    name: 'collections',
    'x-component': 'DatabaseCollection',
    'x-component-props': {},
    default: [
      {
        name: 'test1',
        title: '数据表 1',
      },
      {
        name: 'test2',
        title: '数据表 2',
      },
    ],
    properties: {
      title: {
        type: 'string',
        title: '数据表名称',
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input',
      },
      name: {
        type: 'string',
        title: '数据表标识',
        'x-decorator': 'FormItem',
        'x-component': 'Input',
        'x-read-pretty': true,
      },
      fields: {
        type: 'array',
        title: '数据表字段',
        'x-decorator': 'FormItem',
        'x-component': 'DatabaseField',
        default: [],
      },
    },
  };
  return <SchemaRenderer schema={schema} />;
};