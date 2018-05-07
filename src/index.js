import { makeExecutableSchema } from 'graphql-tools';
import merge from 'lodash.merge';

export default function createRootSchema(schemas, options) {
  // Query and Mutation must be non-empty, even if they will be extended
  const rootTypes = /* GraphQL */ `
    type Mutation {
      _: String
    }
    type Query {
      _: String
    }
  `;

  // Combine types and resolvers into an object usable by `makeExecutableSchema`
  const { resolvers, typeDefs } = schemas.reduce(
    (schemaList, schema) => ({
      resolvers: merge(schemaList.resolvers, schema.resolvers),
      typeDefs: [
        ...schemaList.typeDefs,
        ...(Array.isArray(schema.type) ? schema.type : [schema.type])
      ]
    }),
    { typeDefs: [rootTypes] }
  );

  return makeExecutableSchema({
    resolvers,
    typeDefs,
    ...options
  });
}
