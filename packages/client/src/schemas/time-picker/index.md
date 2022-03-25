---
nav:
  path: /components
group:
  path: /components/schema-components
---

# TimePicker - 时间选择器

## Node Tree

<pre lang="tsx">
<TimePicker/>
</pre>

## Designable Bar

- TimePicker.DesignableBar

## Examples

### 日期选择器

```tsx
/**
 * title: 日期选择器
 */
import React from 'react';
import { SchemaRenderer } from '../';

const schema = {
  type: 'object',
  properties: {
    input: {
      type: 'string',
      title: `编辑模式`,
      'x-decorator': 'FormItem',
      'x-component': 'TimePicker',
      'x-reactions': {
        target: 'read',
        fulfill: {
          state: {
            value: '{{$self.value}}',
          },
        },
      },
    },
    read: {
      type: 'string',
      title: `阅读模式`,
      'x-read-pretty': true,
      'x-decorator': 'FormItem',
      'x-component': 'TimePicker',
    },
  }
}

export default () => {
  return (
    <SchemaRenderer schema={schema} />
  );
};
```
