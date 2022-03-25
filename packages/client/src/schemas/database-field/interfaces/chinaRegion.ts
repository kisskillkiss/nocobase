import { defaultProps } from './properties';
import { FieldOptions } from '.';
import { uid } from '@formily/shared';

export const chinaRegion: FieldOptions = {
  name: 'chinaRegion',
  type: 'object',
  group: 'choices',
  order: 7,
  title: '{{t("China region")}}',
  isAssociation: true,
  default: {
    dataType: 'belongsToMany',
    target: 'china_regions',
    targetKey: 'code',
    // name,
    uiSchema: {
      type: 'array',
      // title,
      'x-component': 'Cascader',
      'x-component-props': {
        changeOnSelectLast: false,
        loadData: '{{ ChinaRegion.loadData() }}',
        labelInValue: true,
        maxLevel: 3,
        fieldNames: {
          label: 'name',
          value: 'code',
          children: 'children',
        },
      },
      'x-reactions': [
        '{{ ChinaRegion.useFieldValue }}',
        '{{ useAsyncDataSource(ChinaRegion.loadDataSource()) }}',
      ],
      'x-decorator': 'FormItem',
      'x-designable-bar': 'Cascader.DesignableBar',
    },
  },
  initialize: (values: any) => {
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
      values.targetKey = 'id';
    }
  },
  properties: {
    ...defaultProps,
    'uiSchema.x-component-props.maxLevel': {
      type: 'number',
      'x-component': 'Radio.Group',
      'x-decorator': 'FormItem',
      title: '{{t("Select level")}}',
      default: 3,
      enum: [
        { value: 1, label: '{{t("Province")}}' },
        { value: 2, label: '{{t("City")}}' },
        { value: 3, label: '{{t("Area")}}' },
        { value: 4, label: '{{t("Street")}}' },
        { value: 5, label: '{{t("Village")}}' },
      ],
    },
    'uiSchema.x-component-props.changeOnSelectLast': {
      type: 'boolean',
      'x-component': 'Checkbox',
      'x-content': '{{t("Must select to the last level")}}',
      'x-decorator': 'FormItem',
    },
  },
  operations: [{ label: '{{t("is")}}', value: 'code.in' }],
};
