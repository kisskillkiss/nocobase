import { defaultProps } from './properties';
import { uid } from '@formily/shared';
import { FieldOptions } from '.';

export const linkTo: FieldOptions = {
  name: 'linkTo',
  type: 'object',
  group: 'relation',
  order: 1,
  title: '{{t("Link to")}}',
  isAssociation: true,
  default: {
    dataType: 'belongsToMany',
    // name,
    uiSchema: {
      type: 'array',
      // title,
      'x-component': 'Select.Drawer',
      'x-component-props': {},
      'x-decorator': 'FormItem',
      'x-designable-bar': 'Select.Drawer.DesignableBar',
    },
  },
  initialize: (values: any) => {
    if (values.dataType === 'belongsToMany') {
      if (!values.through) {
        values.through = `t_${uid()}`;
      }
      if (!values.foreignKey) {
        values.foreignKey = `f_${uid()}`;
      }
      if (!values.otherKey) {
        values.otherKey = `f_${uid()}`;
      }
      if (!values.sourceKey) {
        values.sourceKey = 'id';
      }
      if (!values.targetKey) {
        if (values.target === 'roles') {
          values.targetKey = 'name';
        } else {
          values.targetKey = 'id';
        }
      }
    }
  },
  properties: {
    ...defaultProps,
    target: {
      type: 'string',
      title: '{{t("Related collection")}}',
      required: true,
      'x-reactions': ['{{useAsyncDataSource(loadCollections)}}'],
      'x-decorator': 'FormItem',
      'x-component': 'Select',
    },
    // 'uiSchema.x-component-props.fieldNames.label': {
    //   type: 'string',
    //   title: '要显示的标题字段',
    //   required: true,
    //   'x-reactions': ['{{useAsyncDataSource(loadCollectionFields)}}'],
    //   'x-decorator': 'FormItem',
    //   'x-component': 'Select',
    // },
    'uiSchema.x-component-props.multiple': {
      type: 'boolean',
      'x-content': '{{t("Allow linking to multiple records")}}',
      'x-decorator': 'FormItem',
      'x-component': 'Checkbox',
    },
  },
};
