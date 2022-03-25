import { ArrayField } from '@formily/core';
import { Schema } from '@formily/react';
import { BaseResult } from '@ahooksjs/use-request/lib/types';
import { Resource } from '../../resource';

export interface ITableContext {
  props: any;
  field: ArrayField;
  schema: Schema;
  service: BaseResult<any, any>;
  selectedRowKeys?: any;
  setSelectedRowKeys?: any;
  pagination?: any;
  setPagination?: any;
  refresh?: any;
  resource?: Resource;
}

export interface ITableRowContext {
  index: number;
  record: any;
}
