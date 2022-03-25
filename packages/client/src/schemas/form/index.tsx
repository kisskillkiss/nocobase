import React, { useContext, useMemo, useRef, useState } from 'react';
import { createForm } from '@formily/core';
import {
  SchemaOptionsContext,
  Schema,
  useFieldSchema,
  observer,
  SchemaExpressionScopeContext,
  FormProvider,
  useField,
  useForm,
  RecursionField,
} from '@formily/react';
import {
  useSchemaPath,
  SchemaField,
  useDesignable,
  removeSchema,
  ISchema,
} from '../';
import get from 'lodash/get';
import { Button, Dropdown, Menu, message, Space } from 'antd';
import { MenuOutlined, DragOutlined } from '@ant-design/icons';
import cls from 'classnames';
import { FormLayout } from '@formily/antd';
import './style.less';
import AddNew from '../add-new';
import { DraggableBlockContext } from '../../components/drag-and-drop';
import { isGridRowOrCol } from '../grid';
import constate from 'constate';
import { useEffect } from 'react';
import { uid, merge } from '@formily/shared';
import { getSchemaPath } from '../../components/schema-renderer';
import { DesignableBar } from './DesignableBar';
import { FieldDesignableBar } from './Field.DesignableBar';
import { createContext } from 'react';
import { BlockItem } from '../block-item';
import {
  CollectionProvider,
  useCollectionContext,
  DisplayedMapProvider,
  useDisplayedMapContext,
} from '../../constate';
import { useResource as useGeneralResource } from '../../hooks/useResource';
import { Resource } from '../../resource';
import { BaseResult } from '@ahooksjs/use-request/lib/types';
import { CollectionFieldContext } from '../table';
import { useTranslation } from 'react-i18next';

export interface DescriptionsContextProps {
  resource?: Resource;
  service?: BaseResult<any, any>;
}

export const DescriptionsContext = createContext<DescriptionsContextProps>({});

const FormMain = (props: any) => {
  const { t } = useTranslation();
  const {
    useResource = useGeneralResource,
    showDefaultButtons = false,
    ...others
  } = props;
  const { schema } = useDesignable();
  const form = useMemo(() => {
    return createForm({
      readPretty: schema['x-read-pretty'],
    });
  }, []);
  const { resource, run, service } = useResource({
    onSuccess: (initialValues: any) => {
      console.log('onSuccess', { initialValues });
      form.setInitialValues(initialValues);
      form.setValues(initialValues);
    },
  });
  const path = useSchemaPath();
  const scope = useContext(SchemaExpressionScopeContext);
  const options = useContext(SchemaOptionsContext);
  const displayed = useDisplayedMapContext();
  const { collection } = useCollectionContext();
  useEffect(() => {
    const keys = [...displayed.map.keys()];
    if (keys.length) {
      run({ 'fields[appends]': keys });
      console.log(displayed.map, 'displayed.map', collection?.name);
    }
  }, [displayed.map]);
  const s: ISchema = {
    type: 'object',
    properties: {
      [schema.name]: {
        ...schema.toJSON(),
        'x-path': path,
        // 避免死循环
        'x-decorator': 'Form.__Decorator',
      },
    },
  };
  const content = (
    <FormProvider form={form}>
      {schema['x-decorator'] === 'Form' ? (
        <FormLayout layout={'vertical'} {...others}>
          <SchemaField
            components={options.components}
            scope={scope}
            schema={s}
          />
        </FormLayout>
      ) : (
        <FormLayout layout={'vertical'} {...others}>
          <SchemaField
            scope={scope}
            schema={{
              type: 'object',
              properties: schema.properties,
            }}
          />
        </FormLayout>
      )}
      {showDefaultButtons && (
        <Space style={{ marginTop: 24 }}>
          <Button
            onClick={async () => {
              const values = await form.submit();
              console.log({ values });
              await resource.save(values);
              message.success(t('Saved successfully'));
              await form.reset();
            }}
            type={'primary'}
          >
            {t('Submit')}
          </Button>
          <Button
            onClick={async () => {
              await form.reset();
            }}
          >
            {t('Reset')}
          </Button>
        </Space>
      )}
    </FormProvider>
  );

  return schema['x-read-pretty'] ? (
    <DescriptionsContext.Provider value={{ resource, service }}>
      {content}
    </DescriptionsContext.Provider>
  ) : (
    <>{content}</>
  );
};

export const Form: any = observer((props: any) => {
  const { collection } = useCollectionContext();
  return (
    <CollectionProvider
      collectionName={props.collectionName || collection?.name}
    >
      <DisplayedMapProvider>
        <FormMain {...props} />
      </DisplayedMapProvider>
    </CollectionProvider>
  );
});

export const RandomNameContext = createContext(null);

Form.Field = observer((props: any) => {
  const { fieldName } = props;
  const { schema } = useDesignable();
  const path = getSchemaPath(schema);
  const { getField } = useCollectionContext();
  const displayed = useDisplayedMapContext();
  useEffect(() => {
    if (fieldName) {
      displayed.set(fieldName, schema);
    }
  }, [fieldName, schema]);
  if (!fieldName) {
    return null;
  }
  const collectionField = getField(fieldName);
  if (!collectionField) {
    return null;
  }
  const randomName = useContext(RandomNameContext);
  const title = schema['title'] || collectionField?.uiSchema?.title;
  const required = schema['required'] || collectionField?.uiSchema?.required;
  const description =
    schema['description'] || collectionField?.uiSchema?.description;
  console.log('schema.properties', schema.properties);

  const componentProps = merge(
    collectionField?.uiSchema?.['x-component-props'] || {},
    schema?.['x-component-props'] || {},
    {
      arrayMerge: (t, s) => s,
    },
  );
  return (
    <CollectionFieldContext.Provider value={collectionField}>
      <RecursionField
        name={randomName}
        schema={
          new Schema({
            'x-path': path,
            type: 'void',
            properties: {
              [collectionField.name]: {
                ...collectionField.uiSchema,
                title,
                required,
                description,
                'x-decorator': 'FormilyFormItem',
                'x-component-props': componentProps,
                properties: {
                  ...schema.properties,
                },
              },
            },
          } as ISchema)
        }
      />
    </CollectionFieldContext.Provider>
  );
});

Form.Field.Item = observer((props) => {
  return (
    <RandomNameContext.Provider value={uid()}>
      <BlockItem {...props}>{props.children}</BlockItem>
    </RandomNameContext.Provider>
  );
});

Form.__Decorator = ({ children }) => children;
Form.DesignableBar = DesignableBar;
Form.Field.DesignableBar = FieldDesignableBar;
