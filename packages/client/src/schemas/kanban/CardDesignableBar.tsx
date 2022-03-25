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
import { useSchemaPath, SchemaField, useDesignable, ISchema } from '../';
import get from 'lodash/get';
import { Button, Dropdown, Menu, Space } from 'antd';
import { MenuOutlined, DragOutlined } from '@ant-design/icons';
import cls from 'classnames';
import { FormLayout } from '@formily/antd';
import './style.less';
import AddNew from '../add-new';
import { DraggableBlockContext } from '../../components/drag-and-drop';
import { isGridRowOrCol } from '../grid';
import constate from 'constate';
import { useEffect } from 'react';
import { uid } from '@formily/shared';
import { getSchemaPath } from '../../components/schema-renderer';
import {
  useCollection,
  useCollectionContext,
  useDisplayedMapContext,
  useClient,
} from '../../constate';
import { useTable } from '../table';
import SwitchMenuItem from '../../components/SwitchMenuItem';
import { useKanban } from '.';
import { isAssociation } from '../database-field/interfaces';
import { useTranslation } from 'react-i18next';

export const CardDesignableBar = observer((props) => {
  const { t } = useTranslation();
  const field = useField();
  const { schema, appendChild, deepRemove } = useDesignable();
  const [visible, setVisible] = useState(false);
  const { collection, fields } = useCollectionContext();
  const displayed = useDisplayedMapContext();
  console.log('useDisplayedMapContext', schema);
  const { service } = useKanban();
  const { createSchema, removeSchema } = useClient();
  return (
    <div className={cls('designable-bar', { active: visible })}>
      <span
        onClick={(e) => {
          e.stopPropagation();
        }}
        className={cls('designable-bar-actions', { active: visible })}
      >
        <Space size={2}>
          <Dropdown
            trigger={['hover']}
            visible={visible}
            onVisibleChange={(visible) => {
              setVisible(visible);
            }}
            overlay={
              <Menu>
                <Menu.ItemGroup className={'display-fields'} title={t('Display fields')}>
                  {fields?.map((field) => (
                    <SwitchMenuItem
                      key={field.key}
                      title={field?.uiSchema?.title}
                      checked={displayed.has(field.name)}
                      onChange={async (checked) => {
                        if (!checked) {
                          const s: any = displayed.get(field.name);
                          const p = getSchemaPath(s);
                          const removed = deepRemove(p);
                          if (!removed) {
                            console.log('getSchemaPath', p, removed);
                            return;
                          }
                          const last = removed.pop();
                          displayed.remove(field.name);
                          await removeSchema(last);
                          if (isAssociation(field)) {
                            const appends = service.params[0]?.appends || [];
                            const index = appends.indexOf(field.name);
                            if (index > -1) {
                              appends.splice(index, 1);
                            }
                            await service.run({
                              ...service.params[0],
                              appends,
                            });
                          }
                          return;
                        }
                        let data: ISchema = {
                          key: uid(),
                          name: uid(),
                          type: 'void',
                          'x-decorator': 'Form.Field.Item',
                          'x-decorator-props': {
                            draggable: false,
                          },
                          'x-designable-bar': 'Kanban.FieldDesignableBar',
                          'x-component': 'Form.Field',
                          'x-component-props': {
                            fieldName: field.name,
                          },
                        };
                        const s = appendChild(data);
                        await createSchema(s);
                        if (isAssociation(field)) {
                          const appends = service.params[0]?.appends || [];
                          appends.push(field.name);
                          await service.run({ ...service.params[0], appends });
                        }
                      }}
                    />
                  ))}
                </Menu.ItemGroup>
              </Menu>
            }
          >
            <MenuOutlined />
          </Dropdown>
        </Space>
      </span>
    </div>
  );
});
