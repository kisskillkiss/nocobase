import React, { useContext } from 'react';

import {
  connect,
  mapProps,
  observer,
  useField,
  useFieldSchema,
  mapReadPretty,
} from '@formily/react';
import { Button, Dropdown, Input as AntdInput, Menu, Modal, Space } from 'antd';
import { LoadingOutlined, MenuOutlined, DragOutlined } from '@ant-design/icons';
import { useDesignable } from '../../components/schema-renderer';
import { useState } from 'react';
import AddNew from '../add-new';
import cls from 'classnames';
import { DraggableBlockContext } from '../../components/drag-and-drop';
import { uid } from '@formily/shared';
import { removeSchema, updateSchema } from '..';
import { isGridRowOrCol } from '../grid';
import G2Plot from './G2Plot';
import { Column, Line, Pie, Bar } from '@antv/g2plot';
import { DragHandle } from '../../components/Sortable';
import { useTranslation } from 'react-i18next';

export const Chart: any = {};

Chart.Column = observer((props: any) => {
  return <G2Plot plot={Column} config={props.config} />;
});

Chart.Line = observer((props: any) => {
  return <G2Plot plot={Line} config={props.config} />;
});

Chart.Pie = observer((props: any) => {
  return <G2Plot plot={Pie} config={props.config} />;
});

Chart.Bar = observer((props: any) => {
  return <G2Plot plot={Bar} config={props.config} />;
});

Chart.DesignableBar = observer((props) => {
  const { t } = useTranslation();
  const field = useField();
  const { designable, schema, refresh, deepRemove } = useDesignable();
  const [visible, setVisible] = useState(false);
  const { dragRef } = useContext(DraggableBlockContext);
  if (!designable) {
    return null;
  }
  return (
    <div className={cls('designable-bar', { active: visible })}>
      <span
        onClick={(e) => {
          e.stopPropagation();
        }}
        className={cls('designable-bar-actions', { active: visible })}
      >
        <Space size={'small'}>
          <AddNew.CardItem defaultAction={'insertAfter'} ghost />
          <DragHandle />
          <Dropdown
            trigger={['hover']}
            visible={visible}
            onVisibleChange={(visible) => {
              setVisible(visible);
            }}
            overlay={
              <Menu>
                <Menu.Item
                  key={'update'}
                  onClick={() => {
                    field.readPretty = false;
                    setVisible(false);
                  }}
                  disabled
                >
                  {t('Edit')}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  key={'delete'}
                  onClick={async () => {
                    Modal.confirm({
                      title: t(`Delete block`),
                      content: t('Are you sure you want to delete it?'),
                      onOk: async () => {
                        const removed = deepRemove();
                        // console.log({ removed })
                        const last = removed.pop();
                        await removeSchema(last);
                      },
                    });
                  }}
                >
                  {t('Delete')}
                </Menu.Item>
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
