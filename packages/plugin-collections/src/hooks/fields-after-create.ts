import FieldModel from '../models/field';
import { BELONGSTO, BELONGSTOMANY, HASMANY } from '@nocobase/database';

export default async function (model: FieldModel, options: any = {}) {
  const { migrate = true } = options;
  // const Collection = model.database.getModel('collections');
  // if (model.get('interface') === 'subTable') {
  //   const target = model.get('target');
  //   if (target && !model.database.isDefined(target)) {
  //     await Collection.create({
  //       title: model.get('title'),
  //       name: target,
  //       internal: true,
  //       developerMode: true,
  //     }, options);
  //   }
  // }
  if (migrate) {
    await model.migrate(options);
  }
  if (model.get('interface') === 'subTable') {
    const Field = model.database.getModel('fields');
    const fields = await Field.findAll();
    for (const field of fields) {
      if (field.get('through') === model.get('target')) {
        migrate && field.migrate(options);
      }
    }
  }
  // await model.generatePairField(options);
}
