import { Agent, getAgent, getApp } from '.';
import { Application } from '@nocobase/server';
import * as types from '../interfaces/types';
import CollectionModel from '../models/collection';

describe('collection hooks', () => {
  let app: Application;
  let agent: Agent;

  beforeEach(async () => {
    app = await getApp();
    agent = getAgent(app);
    
    await agent.resource('collections').create({
      values: { name: 'users', title: 'users' },
    });
    await agent.resource('collections').create({
      values: { name: 'posts', title: 'posts' },
    });
    await agent.resource('collections').create({
      values: { name: 'comments', title: 'comments' },
    });
  });

  afterEach(() => app.database.close());

  describe('create linkTo field', () => {
    it('belongsTo', async () => {
      const createdField = await agent.resource('collections.fields').create({
        associatedKey: 'posts',
        values: {
          interface: 'linkTo',
          title: 'author',
          target: 'users'
        },
      });

      // console.log(createdField);
    });
  });

});
