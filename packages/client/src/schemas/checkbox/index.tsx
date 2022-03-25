import React from 'react';
import { connect, mapProps, mapReadPretty, useField } from '@formily/react';
import { Checkbox as AntdCheckbox, Tag } from 'antd';
import { CheckboxProps, CheckboxGroupProps } from 'antd/lib/checkbox';
import uniq from 'lodash/uniq';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { isValid } from '@formily/shared';

type ComposedCheckbox = React.FC<CheckboxProps> & {
  Group?: React.FC<CheckboxGroupProps>;
  __ANT_CHECKBOX?: boolean;
};

export const Checkbox: ComposedCheckbox = connect(
  AntdCheckbox,
  mapProps(
    {
      value: 'checked',
      onInput: 'onChange',
    },
    (props, field) => {
      // console.log({ props, field });
      return {
        ...props,
      };
    },
  ),
  mapReadPretty((props) => {
    if (!isValid(props.value)) {
      return <div></div>;
    }
    return props.value ? (
      <CheckOutlined style={{ color: '#52c41a' }} />
    ) : (
      <CloseOutlined style={{ color: '#f5222d' }} />
    );
  }),
);

Checkbox.__ANT_CHECKBOX = true;

Checkbox.Group = connect(
  AntdCheckbox.Group,
  mapProps({
    dataSource: 'options',
  }),
  mapReadPretty((props) => {
    if (!isValid(props.value)) {
      return <div></div>;
    }
    const { options = [] } = props;
    const field = useField<any>();
    const dataSource = field.dataSource || [];
    const value = uniq(field.value ? field.value : []);
    return (
      <div>
        {dataSource
          .filter((option) => value.includes(option.value))
          .map((option, key) => (
            <Tag key={key} color={option.color}>
              {option.label}
            </Tag>
          ))}
      </div>
    );
  }),
);

export default Checkbox;
