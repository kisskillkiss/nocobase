import { TableOptions } from '@nocobase/database';

export default {
  name: 'collections',
  title: '数据表配置',
  sortable: true,
  draggable: true,
  model: 'CollectionModel',
  fields: [
    {
      interface: 'sort',
      type: 'integer',
      name: 'sort',
      title: '排序',
      component: {
        type: 'sort',
        className: 'drag-visible',
        width: 60,
        showInTable: true,
      },
    },
    {
      interface: 'string',
      type: 'string',
      name: 'title',
      title: '数据表名称',
      required: true,
      component: {
        type: 'string',
        className: 'drag-visible',
        showInTable: true,
        showInForm: true,
        showInDetail: true,
      },
    },
    {
      interface: 'string',
      type: 'string',
      name: 'name',
      title: '标识',
      unique: true,
      required: true,
      component: {
        type: 'string',
        showInTable: true,
        showInForm: true,
        showInDetail: true,
      },
    },
    {
      interface: 'string',
      type: 'virtual',
      name: 'options.icon',
      title: '图标',
      component: {
        type: 'string',
        showInTable: true,
        showInForm: true,
        showInDetail: true,
      },
    },
    {
      interface: 'radio',
      type: 'virtual',
      name: 'options.defaultView',
      title: '默认视图',
      defaultValue: 'table',
      dataSource: [
        {label: '表格', value: 'table'},
        {label: '看板', value: 'kanban', disabled: true},
        {label: '日历', value: 'calendar', disabled: true},
      ],
      component: {
        type: 'radio',
        showInTable: true,
        showInForm: true,
        showInDetail: true,
      },
    },
    {
      interface: 'radio',
      type: 'virtual',
      name: 'options.mode',
      title: '表格模式',
      defaultValue: 'default',
      dataSource: [
        {label: '常规模式', value: 'default'},
        {label: '简易模式', value: 'simple'},
      ],
      component: {
        type: 'radio',
        tooltip: `
          <p>常规模式：点击数据进入详情页进行各项查看和操作；<br/>简易模式：点击数据直接打开编辑表单</p>
        `,
        showInForm: true,
        showInDetail: true,
      },
    },
    {
      interface: 'radio',
      type: 'virtual',
      name: 'options.defaultPerPage',
      title: '每页显示几行数据',
      defaultValue: 50,
      dataSource: [
        {label: '20', value: 20},
        {label: '50', value: 50},
        {label: '100', value: 100},
      ],
      component: {
        type: 'radio',
        showInForm: true,
        showInDetail: true,
      },
    },
    {
      interface: 'boolean',
      type: 'virtual',
      name: 'options.draggable',
      title: '支持拖拽数据排序',
      showInForm: true,
      showInDetail: true,
      component: {
        type: 'checkbox',
        showInForm: true,
        showInDetail: true,
      },
    },
    {
      interface: 'boolean',
      type: 'boolean',
      name: 'showInDataMenu',
      title: '显示在“数据”菜单里',
      component: {
        type: 'checkbox',
        showInTable: true,
        showInForm: true,
        showInDetail: true,
      },
    },
    {
      interface: 'json',
      type: 'json',
      name: 'options',
      title: '配置信息',
      defaultValue: {},
      component: {
        type: 'hidden',
      },
    },
    {
      interface: 'linkTo',
      type: 'hasMany',
      name: 'fields',
      title: '字段',
      sourceKey: 'name',
      draggable: true,
      actions: {
        list: {
          sort: 'sort',
        },
      },
      component: {
        type: 'drawerSelect',
      },
    },
    {
      interface: 'linkTo',
      type: 'hasMany',
      name: 'actions',
      title: '动作',
      sourceKey: 'name',
      draggable: true,
      actions: {
        list: {
          sort: 'sort',
        },
      },
      component: {
        type: 'drawerSelect',
      },
    },
    {
      interface: 'linkTo',
      type: 'hasMany',
      name: 'tabs',
      title: '标签页',
      sourceKey: 'name',
      draggable: true,
      actions: {
        list: {
          sort: 'sort',
        },
      },
      component: {
        type: 'drawerSelect',
      },
    },
    {
      interface: 'linkTo',
      type: 'hasMany',
      name: 'views',
      title: '视图',
      sourceKey: 'name',
      draggable: true,
      actions: {
        list: {
          sort: 'sort',
        },
      },
      component: {
        type: 'drawerSelect',
      },
    },
  ],
  actions: [
    {
      type: 'list',
      name: 'list',
      title: '查看',
    },
    {
      type: 'create',
      name: 'create',
      title: '创建',
      viewName: 'form',
    },
    {
      type: 'update',
      name: 'update',
      title: '编辑',
      viewName: 'form',
    },
    {
      type: 'destroy',
      name: 'destroy',
      title: '删除',
    },
  ],
  views: [
    {
      type: 'form',
      name: 'form',
      title: '表单',
      template: 'DrawerForm',
    },
    {
      type: 'details',
      name: 'details',
      title: '详情',
      template: 'Details',
      actionNames: ['update'],
    },
    {
      type: 'table',
      name: 'simple',
      title: '简易模式',
      template: 'SimpleTable',
      actionNames: ['create', 'destroy'],
      detailsViewName: 'details',
      updateViewName: 'form',
    },
    {
      type: 'table',
      name: 'table',
      title: '列表',
      template: 'Table',
      actionNames: ['create', 'destroy'],
      default: true,
    },
  ],
  tabs: [
    {
      type: 'details',
      name: 'details',
      title: '详情',
      viewName: 'details',
      default: true,
    },
    {
      type: 'association',
      name: 'fields',
      title: '字段',
      association: 'fields',
      viewName: 'simple',
    },
    {
      type: 'association',
      name: 'views',
      title: '视图',
      association: 'views',
      viewName: 'simple',
    },
    {
      type: 'association',
      name: 'actions',
      title: '动作',
      association: 'actions',
      viewName: 'simple',
    },
    {
      type: 'association',
      name: 'tabs',
      title: '标签页',
      association: 'tabs',
      viewName: 'simple',
    },
    {
      type: 'association',
      name: 'roles',
      title: '权限',
      association: 'roles',
      viewName: 'simple2',
    },
  ],
} as TableOptions;
