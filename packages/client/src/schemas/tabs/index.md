---
nav:
  path: /components
group:
  path: /components/schema-components
---

# Tabs - 标签页

## Node

<pre lang="tsx">
<Tabs>
  <Tabs.TabPane title={'标签 1'}>
    // 添加其他节点
  </Tabs.TabPane>
  <Tabs.TabPane title={'标签 2'}>
    // 添加其他节点
  </Tabs.TabPane>
</Tabs>
</pre>

## Designable Bar

- Tabs.DesignableBar

## Examples

### 基本使用

```tsx
/**
 * title: 基本使用
 */
import React from 'react';
import { SchemaRenderer } from '../';

const schema = {
  type: 'object',
  properties: {
    tabs: {
      type: 'void',
      'x-decorator': 'Card',
      'x-component': 'Tabs',
      'x-designable-bar': 'Tabs.DesignableBar',
      'x-component-props': {
        // singleton: true,
      },
      properties: {
        tab1: {
          type: 'void',
          title: 'Tab1',
          'x-component': 'Tabs.TabPane',
          'x-designable-bar': 'Tabs.TabPane.DesignableBar',
          'x-component-props': {
            tab: 'Tab1',
          },
          properties: {
            aaa: {
              type: 'string',
              title: 'AAA',
              'x-decorator': 'FormItem',
              required: true,
              'x-component': 'Input',
            },
          },
        },
        tab2: {
          type: 'void',
          title: 'Tab2',
          'x-component': 'Tabs.TabPane',
          'x-designable-bar': 'Tabs.TabPane.DesignableBar',
          'x-component-props': {
            tab: 'Tab2',
          },
          properties: {
            bbb: {
              type: 'string',
              title: 'BBB',
              'x-decorator': 'FormItem',
              required: true,
              'x-component': 'Input',
            },
          },
        },
      },
    },
  }
}

export default () => {
  return (
    <SchemaRenderer schema={schema} />
  );
};
```
