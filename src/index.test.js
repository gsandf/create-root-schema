import test from 'ava';
import { graphql } from 'graphql';
import { timestampSchema, userSchema } from './testHelpers/schemas';
import createRootSchema from '.';

test('Throws if no schema given', t => {
  t.throws(() => createRootSchema());
  t.throws(() => createRootSchema(null));
  t.throws(() => createRootSchema(undefined));
  t.throws(() => createRootSchema('🍍'));
  // Needs array
  t.throws(() => createRootSchema({ type: 'type Test { test: String }' }));
});

test('Creates a basic schema', async t => {
  const testSchema = { type: 'type Test { test: String }' };
  const combinedSchema = createRootSchema([testSchema]);

  t.truthy(combinedSchema._typeMap.Test);
  t.falsy(combinedSchema._typeMap.Blah);
});

test('Allows custom scalars', t => {
  const combinedSchema = createRootSchema([timestampSchema, userSchema]);

  t.truthy(combinedSchema._typeMap.Timestamp);
  t.truthy(combinedSchema._typeMap.User);
  t.falsy(combinedSchema._typeMap.Blah);
});

test('Creates queries', async t => {
  const combinedSchema = createRootSchema([timestampSchema, userSchema]);
  const query = '{ users { name } }';
  const response = await graphql(combinedSchema, query);
  const expected = [{ name: 'Tom Bombadil' }, { name: 'Aragorn' }];

  t.deepEqual(response.data.users, expected);
});

test('Allows mutations', async t => {
  const combinedSchema = createRootSchema([timestampSchema, userSchema]);
  const query = 'mutation { seen (id: "QXJhZ29ybgo=") { lastSeen, name } }';
  const response = await graphql(combinedSchema, query);

  t.is(response.data.seen.name, 'Aragorn');
  t.true(response.data.seen.lastSeen > Date.now() - 1000);
  t.true(response.data.seen.lastSeen < Date.now());
});
