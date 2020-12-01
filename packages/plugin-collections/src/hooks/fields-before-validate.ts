import FieldModel from '../models/field';
import * as types from '../interfaces/types';

export default async function (model: FieldModel) {
  const values = model.get();
  if (!values.name) {
    values.name = this.generateName();
  }
  if (values.interface) {
    const { options, make } = types[values.interface];
    if (typeof make === 'function') {
      make(values);
    } else {
      Object.keys(options).forEach(key => {
        switch (typeof values[key]) {
          case 'undefined':
            values[key] = options[key];
            break;
            
          case 'object':
            values[key] = {
              ...options[key],
              ...values[key]
            };
            break;
        }
      });
    }
  }

  model.set(values, { raw: true });
}
