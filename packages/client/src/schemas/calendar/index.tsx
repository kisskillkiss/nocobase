import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar as BigCalendar,
  Views,
  momentLocalizer,
} from 'react-big-calendar';
import moment from 'moment';
import * as dates from 'react-big-calendar/lib/utils/dates';
import { navigate } from 'react-big-calendar/lib/utils/constants';
import {
  LeftOutlined,
  RightOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Space,
  Button,
  Radio,
  Select,
  Popover,
  Dropdown,
  Menu,
  Drawer,
} from 'antd';
import './style2.less';
import './designable.less';

import {
  FormProvider,
  observer,
  RecursionField,
  Schema,
  useField,
  useForm,
} from '@formily/react';
import { DesignableBar } from './DesignableBar';
import { createContext } from 'react';
import { useContext } from 'react';
import { SchemaField, useDesignable } from '../../components/schema-renderer';
import { ActionBar } from './ActionBar';
import { ActionDesignableBar } from './Action';
import { ArrayField, createForm } from '@formily/core';
import { get } from 'lodash';
import flatten from 'flat';
import {
  CollectionProvider,
  useCollectionContext,
  useDisplayedMapContext,
  useResourceRequest,
} from '../../constate';
import { FormButtonGroup, FormDialog, FormLayout, Submit } from '@formily/antd';
import IconPicker from '../../components/icon-picker';
import { DragHandle } from '../../components/Sortable';
import SwitchMenuItem from '../../components/SwitchMenuItem';
import { removeSchema, updateSchema } from '..';
import { MenuOutlined } from '@ant-design/icons';
import { interfaces } from '../database-field/interfaces';
import cls from 'classnames';
import { Resource } from '../../resource';
import { useRequest } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { useCompile } from '../../hooks/useCompile';
import { i18n } from '../../i18n';

const localizer = momentLocalizer(moment);

const allViews = Object.keys(Views).map((k) => Views[k]);

interface ToolbarProps {
  localizer?: any;
  label?: any;
  view?: any;
  views?: any;
  onNavigate?: (action: string) => void;
  onView?: (view: string) => void;
}

export const RecordContext = createContext(null);
export const ToolbarContext = createContext<ToolbarProps>(null);
export const CalendarContext = createContext(null);

function Toolbar(props: ToolbarProps) {
  const {
    label,
    views,
    view,
    onNavigate,
    onView,
    localizer: { messages },
  } = props;
  const { schema } = useDesignable();
  const toolBarSchema: Schema = schema.reduceProperties((buf, current) => {
    if (current['x-component'] === 'Calendar.Toolbar') {
      return current;
    }
    return buf;
  }, null);

  return (
    <ToolbarContext.Provider value={props}>
      <RecursionField name={toolBarSchema.name} schema={toolBarSchema} />
    </ToolbarContext.Provider>
  );
}

const messages: any = {
  allDay: '',
  previous: (
    <div>
      <LeftOutlined />
    </div>
  ),
  next: (
    <div>
      <RightOutlined />
    </div>
  ),
  today: i18n.t('Today'),
  month: i18n.t('Month'),
  week: i18n.t('Week'),
  work_week: i18n.t('Work week'),
  day: i18n.t('Day'),
  agenda: i18n.t('Agenda'),
  date: i18n.t('Date'),
  time: i18n.t('Time'),
  event: i18n.t('Event'),
  noEventsInRange: i18n.t('None'),
  showMore: (count) => i18n.t('{{count}} more items', { count }),
};

const useCalendar = () => {
  return useContext(CalendarContext);
};

const toEvents = (data: any[], fieldNames: any) => {
  return data?.map((item) => {
    return {
      id: get(item, fieldNames.id || 'id'),
      title: get(item, fieldNames.title) || i18n.t('Untitle'),
      start: new Date(get(item, fieldNames.start)),
      end: new Date(get(item, fieldNames.end || fieldNames.start)),
    };
  });
};

export const Calendar: any = observer((props: any) => {
  const { t } = useTranslation();
  const field = useField<ArrayField>();
  const { collectionName, fieldNames = {} } = props;
  console.log('Calendar', props);
  const { schema } = useDesignable();
  const eventSchema: Schema = schema.reduceProperties((buf, current) => {
    if (current['x-component'] === 'Calendar.Event') {
      return current;
    }
    return buf;
  }, null);
  const resource = useResourceRequest(collectionName);
  const service = useRequest(
    (params) => {
      if (!collectionName) {
        return Promise.resolve({});
      }
      return resource.list({
        ...params,
        perPage: -1,
      });
    },
    {
      formatResult: (data) => data?.data,
      onSuccess(data) {
        const events = toEvents(data, fieldNames) || [];
        console.log('events', events);
        field.setValue(events);
      },
      // refreshDeps: [props.fieldNames],
    },
  );
  useEffect(() => {
    service.run({
      defaultFilter: props?.defaultFilter,
      sort: props?.fieldNames?.start || 'created_at',
    });
  }, [props?.fieldNames, props.defaultFilter]);
  const [visible, setVisible] = useState(false);
  const [record, setRecord] = useState<any>({});
  console.log('field.value', field.value);
  return (
    <CollectionProvider collectionName={props.collectionName}>
      <CalendarContext.Provider value={{ field, resource, service, props }}>
        <div {...props} style={{ height: 700 }}>
          <Drawer
            width={'50%'}
            visible={visible}
            onClose={() => {
              setVisible(false);
            }}
            title={t('View record')}
            bodyStyle={{
              background: '#f0f2f5',
              paddingTop: 0,
            }}
          >
            <RecordContext.Provider value={record}>
              <RecursionField
                name={eventSchema.name}
                schema={eventSchema}
                onlyRenderProperties
              />
            </RecordContext.Provider>
          </Drawer>
          <BigCalendar
            popup
            selectable
            events={
              Array.isArray(field.value.slice()) ? field.value.slice() : []
            }
            views={['month', 'week', 'day']}
            step={60}
            showMultiDayTimes
            messages={messages}
            onSelectSlot={(slotInfo) => {
              console.log('onSelectSlot', slotInfo);
            }}
            onDoubleClickEvent={(event) => {
              console.log('onDoubleClickEvent');
            }}
            onSelectEvent={(event) => {
              const record = field.value?.find((item) => item.id === event.id);
              if (!record) {
                return;
              }
              setRecord(record);
              setVisible(true);
              console.log('onSelectEvent');
            }}
            formats={{
              monthHeaderFormat: 'Y-M',
              agendaDateFormat: 'M-DD',
              dayHeaderFormat: 'Y-M-DD',
              dayRangeHeaderFormat: ({ start, end }, culture, local) => {
                if (dates.eq(start, end, 'month')) {
                  return local.format(start, 'Y-M', culture);
                }
                return `${local.format(
                  start,
                  'Y-M',
                  culture,
                )} - ${local.format(end, 'Y-M', culture)}`;
              },
            }}
            defaultDate={new Date()}
            components={{
              toolbar: Toolbar,
            }}
            localizer={localizer}
          />
        </div>
      </CalendarContext.Provider>
    </CollectionProvider>
  );
});

Calendar.useCreateAction = () => {
  const { service, resource } = useCalendar();
  const form = useForm();
  return {
    async run() {
      await resource.create(form.values);
      await form.reset();
      return service.refresh();
    },
  };
};

Calendar.useResource = ({ onSuccess }) => {
  const { props } = useCalendar();
  const { collection } = useCollectionContext();
  const record = useContext(RecordContext);
  const resource = useResourceRequest({
    resourceName: collection?.name || props.collectionName,
    resourceIndex: record['id'],
  });
  console.log(
    'collection?.name || props.collectionName',
    collection?.name || props.collectionName,
  );
  const service = useRequest(
    (params?: any) => {
      console.log('Table.useResource', params);
      return resource.get(params);
    },
    {
      formatResult: (result) => result?.data,
      onSuccess,
      refreshDeps: [record],
      // manual,
    },
  );
  return { resource, service, initialValues: service.data, ...service };
};

Calendar.Toolbar = ActionBar;

Calendar.Title = observer(() => {
  const { DesignableBar } = useDesignable();
  const { label } = useContext(ToolbarContext);
  return (
    <div
      className="ant-btn-group"
      style={{ fontSize: '1.75em', fontWeight: 300 }}
    >
      {label}
      <DesignableBar />
    </div>
  );
});

Calendar.Today = observer((props) => {
  const { DesignableBar } = useDesignable();
  const { onNavigate } = useContext(ToolbarContext);
  const { t } = useTranslation();
  return (
    <Button
      onClick={() => {
        onNavigate(navigate.TODAY);
      }}
    >
      {t('Today')}
      <DesignableBar />
    </Button>
  );
});

Calendar.Nav = observer((props) => {
  const { DesignableBar } = useDesignable();
  const { onNavigate } = useContext(ToolbarContext);
  return (
    <div className="ant-btn-group">
      <Button
        icon={<LeftOutlined />}
        onClick={() => onNavigate(navigate.PREVIOUS)}
      ></Button>
      <Button
        icon={<RightOutlined />}
        onClick={() => onNavigate(navigate.NEXT)}
      ></Button>
      <DesignableBar />
    </div>
  );
});

Calendar.ViewSelect = observer((props) => {
  const { DesignableBar } = useDesignable();
  const {
    views,
    view,
    onView,
    localizer: { messages },
  } = useContext(ToolbarContext);
  return (
    <div className="ant-btn-group">
      <Select value={view} onChange={onView}>
        {views.map((name) => (
          <Select.Option value={name}>{messages[name]}</Select.Option>
        ))}
      </Select>
      <DesignableBar />
    </div>
  );
});

export const fieldsToFilterColumns = (fields: any[], options: any = {}) => {
  const { fieldNames = [] } = options;
  const properties = {};
  fields.forEach((field, index) => {
    if (fieldNames?.length && !fieldNames.includes(field.name)) {
      return;
    }
    const fieldOption = interfaces.get(field.interface);
    if (!fieldOption?.operations) {
      return;
    }
    properties[`column${index}`] = {
      type: 'void',
      title: field?.uiSchema?.title,
      'x-component': 'Filter.Column',
      'x-component-props': {
        operations: fieldOption.operations,
      },
      properties: {
        [field.name]: {
          ...field.uiSchema,
          'x-decorator': 'FormilyFormItem',
          title: null,
        },
      },
    };
  });
  return properties;
};

Calendar.Filter = observer((props: any) => {
  const { service } = useCalendar();
  const { t } = useTranslation();
  const compile = useCompile();
  const { fieldNames = [] } = props;
  const { schema, DesignableBar } = useDesignable();
  const form = useMemo(() => createForm(), []);
  const { fields = [] } = useCollectionContext();
  const [visible, setVisible] = useState(false);
  const obj = flatten(form.values.filter || {});
  const count = Object.values(obj).filter((i) =>
    Array.isArray(i) ? i.length : i,
  ).length;
  const icon = props.icon || 'FilterOutlined';
  const properties = fieldsToFilterColumns(fields, { fieldNames });
  schema.mapProperties((p) => {
    properties[p.name] = p;
  });
  return (
    <Popover
      trigger={['click']}
      placement={'bottomLeft'}
      visible={visible}
      onVisibleChange={setVisible}
      content={
        <div>
          <FormProvider form={form}>
            <SchemaField
              schema={{
                type: 'object',
                properties: {
                  filter: {
                    type: 'object',
                    'x-component': 'Filter',
                    properties,
                  },
                },
              }}
            />
            <FormButtonGroup align={'right'}>
              <Submit
                onSubmit={() => {
                  const { filter } = form.values;
                  console.log('Table.Filter', form.values);
                  setVisible(false);
                  // return service.run({
                  //   ...service.params[0],
                  //   filter,
                  // });
                }}
              >
                {t('Submit')}
              </Submit>
            </FormButtonGroup>
          </FormProvider>
        </div>
      }
    >
      <Button icon={<IconPicker type={icon} />}>
        {count > 0 ? t('{{count}} filter items', { count }) : compile(schema.title)}
        <DesignableBar />
      </Button>
    </Popover>
  );
});

Calendar.Filter.DesignableBar = () => {
  const { t } = useTranslation();
  const { schema, remove, refresh, insertAfter } = useDesignable();
  const [visible, setVisible] = useState(false);
  const displayed = useDisplayedMapContext();
  const { fields } = useCollectionContext();
  const field = useField();
  let fieldNames = field.componentProps.fieldNames || [];
  if (fieldNames.length === 0) {
    fieldNames = fields.map((field) => field.name);
  }
  return (
    <div className={cls('designable-bar', { active: visible })}>
      <span
        onClick={(e) => {
          e.stopPropagation();
        }}
        className={cls('designable-bar-actions', { active: visible })}
      >
        <Space>
          <DragHandle />
          <Dropdown
            trigger={['hover']}
            visible={visible}
            onVisibleChange={(visible) => {
              setVisible(visible);
            }}
            overlay={
              <Menu>
                <Menu.ItemGroup title={t('Filterable fields')}>
                  {fields
                    .filter((collectionField) => {
                      const option = interfaces.get(collectionField.interface);
                      return option?.operations?.length;
                    })
                    .map((collectionField) => (
                      <SwitchMenuItem
                        title={collectionField?.uiSchema?.title}
                        checked={fieldNames.includes(collectionField.name)}
                        onChange={async (checked) => {
                          if (checked) {
                            fieldNames.push(collectionField.name);
                          } else {
                            const index = fieldNames.indexOf(
                              collectionField.name,
                            );
                            if (index > -1) {
                              fieldNames.splice(index, 1);
                            }
                          }
                          console.log({ fieldNames, field });
                          schema['x-component-props']['fieldNames'] =
                            fieldNames;
                          field.componentProps.fieldNames = fieldNames;
                          updateSchema(schema);
                        }}
                      />
                    ))}
                </Menu.ItemGroup>
                <Menu.Divider />
                <Menu.Item
                  onClick={async (e) => {
                    setVisible(false);
                    const values = await FormDialog(t('Edit button'), () => {
                      return (
                        <FormLayout layout={'vertical'}>
                          <SchemaField
                            schema={{
                              type: 'object',
                              properties: {
                                title: {
                                  type: 'string',
                                  title: t('Display name'),
                                  required: true,
                                  'x-decorator': 'FormItem',
                                  'x-component': 'Input',
                                },
                                icon: {
                                  type: 'string',
                                  title: t('Icon'),
                                  'x-decorator': 'FormItem',
                                  'x-component': 'IconPicker',
                                },
                              },
                            }}
                          />
                        </FormLayout>
                      );
                    }).open({
                      initialValues: {
                        title: schema['title'],
                        icon: schema['x-component-props']?.['icon'],
                      },
                    });
                    schema['title'] = values.title;
                    schema['x-component-props']['icon'] = values.icon;
                    field.componentProps.icon = values.icon;
                    field.title = values.title;
                    updateSchema(schema);
                    refresh();
                  }}
                >
                  {t('Edit button')}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  onClick={async () => {
                    const displayName =
                      schema?.['x-decorator-props']?.['displayName'];
                    const data = remove();
                    await removeSchema(data);
                    if (displayName) {
                      displayed.remove(displayName);
                    }
                    setVisible(false);
                  }}
                >
                  {t('Hide')}
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
};

Calendar.DesignableBar = DesignableBar;

Calendar.ActionDesignableBar = ActionDesignableBar;
