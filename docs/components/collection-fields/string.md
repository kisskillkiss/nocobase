# String - 单行文本

## Interface

```ts
export const string: FieldOptions = {
  name: 'string',
  type: 'object',
  group: 'basic',
  order: 1,
  title: '单行文本',
  sortable: true,
  default: {
    interface: 'string',
    type: 'string',
    // name,
    uiSchema: {
      type: 'string',
      // title,
      'x-component': 'Input',
      'x-decorator': 'FormItem',
      'x-designable-bar': 'Input.DesignableBar',
    },
  },
  properties: {
    ...defaultProps,
  },
  operations: [
    { label: '包含', value: '$includes', selected: true },
    { label: '不包含', value: '$notIncludes' },
    { label: '等于', value: 'eq' },
    { label: '不等于', value: 'ne' },
    { label: '非空', value: '$notNull', noValue: true },
    { label: '为空', value: '$null', noValue: true },
  ],
};
```