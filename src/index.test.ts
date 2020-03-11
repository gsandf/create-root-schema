import test from 'ava';
import { graphql } from 'graphql';
import { combineSchemaDefinitions, makeExecutableSchema } from '.';
import * as timestampSchema from './testHelpers/schemas/timestamp';
import * as upperCaseDirective from './testHelpers/schemas/uppercase';
import * as userSchema from './testHelpers/schemas/user';
import * as userUpperCaseExtension from './testHelpers/schemas/user-upperCase-extension';

test('Throws if no schema given', t => {
  t.throws(() => combineSchemaDefinitions(null));
  t.throws(() => combineSchemaDefinitions(undefined));
});

test('Creates a basic schema', async t => {
  const testSchema = { typeDefs: 'type Test { test: String }' };
  const typeMap = makeExecutableSchema([testSchema]).getTypeMap();

  t.truthy(typeMap.Test);
  t.falsy(typeMap.Blah);
});

test('Allows custom scalars', t => {
  const typeMap = makeExecutableSchema([
    timestampSchema,
    userSchema
  ]).getTypeMap();

  t.truthy(typeMap.Timestamp);
  t.truthy(typeMap.User);
  t.falsy(typeMap.Blah);
});

test('Creates queries', async t => {
  const schema = makeExecutableSchema([timestampSchema, userSchema]);

  const query = '{ users { name } }';
  const response = await graphql(schema, query);
  const expected = [{ name: 'Tom Bombadil' }, { name: 'Aragorn' }];

  t.deepEqual(response.data.users, expected);
});

test('Allows mutations', async t => {
  const schema = makeExecutableSchema([timestampSchema, userSchema]);

  const query = 'mutation { seen (id: "QXJhZ29ybgo=") { lastSeen, name } }';
  const response = await graphql(schema, query);

  t.is(response.data.seen.name, 'Aragorn');
  t.true(response.data.seen.lastSeen > Date.now() - 1000);
  t.true(response.data.seen.lastSeen < Date.now());
});

test('Allows schema directives', async t => {
  const schema = makeExecutableSchema([
    timestampSchema,
    upperCaseDirective,
    userSchema,
    userUpperCaseExtension
  ]);

  const query = /* GraphQL */ `
    {
      user(id: "QXJhZ29ybgo=") {
        name
        nameUpper
      }
    }
  `;

  const response = await graphql(schema, query);
  const expected = { user: { name: 'Aragorn', nameUpper: 'ARAGORN' } };

  t.deepEqual(response.data, expected);
});
