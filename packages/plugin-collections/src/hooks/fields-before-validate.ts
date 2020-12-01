import _ from 'lodash';
import FieldModel from '../models/field';
import * as types from '../interfaces/types';

export default async function (model: FieldModel) {
  const name = model.get('name');
  if (!name) {
    model.set('name', this.generateName());
  }

  const values = model.get();
  if (values.interface && types[values.interface]) {
    const { options, make } = types[values.interface];
    model.set(_.merge({}, options, values));
    if (typeof make === 'function') {
      make(model);
    }
  }
}
