import React from 'react';
import {
  connect,
  mapReadPretty,
  mapProps,
  useField,
  observer,
} from '@formily/react';
import { Cascader as AntdCascader } from 'antd';
import { Display } from '../display';
import { LoadingOutlined } from '@ant-design/icons';
import { CascaderOptionType } from 'antd/lib/cascader';
import { ArrayField } from '@formily/core';
import { toArr } from '@formily/shared';
import { isBoolean, omit } from 'lodash';

const defaultFieldNames = {
  label: 'label',
  value: 'value',
  children: 'children',
};

export const Cascader = connect(
  (props: any) => {
    const field = useField<ArrayField>();
    const {
      value,
      onChange,
      loadData,
      labelInValue,
      fieldNames = defaultFieldNames,
      changeOnSelectLast,
      changeOnSelect,
      ...others
    } = props;
    console.log('changeOnSelectLast', changeOnSelectLast);
    // 兼容值为 object[] 的情况
    const toValue = () => {
      return toArr(value).map((item) => {
        if (typeof item === 'object') {
          return item[fieldNames.value];
        }
        return item;
      });
    };
    const displayRender = (labels: string[], selectedOptions: any[]) => {
      const values = toArr(value);
      if (values.length !== labels.length) {
        labels = toValue();
        selectedOptions = values;
      }
      if (selectedOptions.length === 0) {
        selectedOptions = values;
      }
      return labels.map((label, i) => {
        let option = selectedOptions[i];
        if (
          !option ||
          typeof option === 'string' ||
          typeof option === 'number'
        ) {
          option = { [fieldNames.label]: label, [fieldNames.value]: label };
        }
        if (i === labels.length - 1) {
          return (
            <span key={option[fieldNames.value]}>
              {option[fieldNames.label]}
            </span>
          );
        }
        return (
          <span key={option[fieldNames.value]}>
            {option[fieldNames.label]} /{' '}
          </span>
        );
      });
    };
    if (loadData) {
      Object.assign(others, {
        loadData: (selectedOptions: CascaderOptionType[]) => {
          // 将 field 传给 loadData
          loadData(selectedOptions, field);
        },
      });
    }
    return (
      <AntdCascader
        {...others}
        changeOnSelect={
          isBoolean(changeOnSelectLast) ? !changeOnSelectLast : changeOnSelect
        }
        value={toValue()}
        fieldNames={fieldNames}
        displayRender={displayRender}
        onChange={(value, selectedOptions) => {
          if (labelInValue) {
            onChange(
              selectedOptions.map((option) =>
                omit(option, [fieldNames.children]),
              ),
            );
          } else {
            onChange(value);
          }
          console.log({ value, selectedOptions });
        }}
      />
    );
  },
  mapProps(
    {
      dataSource: 'options',
    },
    (props, field) => {
      return {
        ...props,
        suffixIcon:
          field?.['loading'] || field?.['validating'] ? (
            <LoadingOutlined />
          ) : (
            props.suffixIcon
          ),
      };
    },
  ),
  mapReadPretty((props) => {
    const { fieldNames = defaultFieldNames } = props;
    const values = toArr(props.value);
    const len = values.length;
    const field = useField<ArrayField>();
    let dataSource = field.dataSource;
    const data = [];
    for (const item of values) {
      if (typeof item === 'object') {
        data.push(item);
      } else {
        const curr = dataSource?.find((v) => v[fieldNames.value] === item);
        dataSource = curr?.[fieldNames.children] || [];
        data.push(curr || { label: item, value: item });
      }
    }
    // console.log({ data });
    return (
      <div>
        {data.map((item, index) => {
          return (
            <span>
              {typeof item === 'object' ? item[fieldNames.label] : item}
              {len > index + 1 && ' / '}
            </span>
          );
        })}
      </div>
    );
  }),
);

export default Cascader;
