import { ISchema } from '@formily/react';
import { defaultProps } from './properties';
import { FieldOptions } from '.';

export const createdBy: FieldOptions = {
  name: 'createdBy',
  type: 'object',
  group: 'systemInfo',
  order: 3,
  title: '{{t("Created by")}}',
  isAssociation: true,
  default: {
    dataType: 'belongsTo',
    target: 'users',
    foreignKey: 'created_by_id',
    // name,
    uiSchema: {
      type: 'object',
      title: '{{t("Created by")}}',
      'x-component': 'Select.Drawer',
      'x-component-props': {
        fieldNames: {
          value: 'id',
          label: 'nickname',
        },
      },
      'x-decorator': 'FormItem',
      'x-read-pretty': true,
      'x-designable-bar': 'Select.Drawer.DesignableBar',
    },
  },
  properties: {
    ...defaultProps,
  },
};
