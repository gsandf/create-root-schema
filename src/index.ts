import { GraphQLSchema } from 'graphql';
import {
  IResolvers,
  makeExecutableSchema as baseMakeExecutableSchema,
  SchemaDirectiveVisitor
} from 'graphql-tools';
import { merge } from 'unchanged';

type SchemaDirective = {
  [name: string]: typeof SchemaDirectiveVisitor;
};
type TypeDef = string;

export interface SchemaPart {
  resolvers?: IResolvers;
  schemaDirectives?: SchemaDirective;
  typeDefs?: TypeDef;
}

export interface SchemaDefinition {
  resolvers?: IResolvers;
  schemaDirectives?: SchemaDirective;
  typeDefs: TypeDef[];
}

function extendIfExists<T>(obj: T, part: T) {
  return part ? merge(null, obj, part) : obj;
}

function mergeSchemaPart(
  schema: SchemaDefinition,
  part: SchemaPart
): SchemaDefinition {
  return {
    // deeply merge the resolver with the rest of the schema
    resolvers: extendIfExists(schema.resolvers, part.resolvers),
    // deeply merge the schemaDirectives
    schemaDirectives: extendIfExists(
      schema.schemaDirectives,
      part.schemaDirectives
    ),
    // append type definitions to existing type definitions
    typeDefs: part.typeDefs
      ? schema.typeDefs.concat(part.typeDefs)
      : schema.typeDefs
  };
}

export function combineSchemaDefinitions(
  schemaParts: SchemaPart[]
): SchemaDefinition {
  // Query and Mutation must be non-empty, even if they will be extended
  const rootTypes = /* GraphQL */ `
    type Mutation {
      _bootstrap_: String
    }
    type Query {
      _bootstrap_: String
    }
  `;

  // Combine types and resolvers into an object usable by `makeExecutableSchema`
  return schemaParts.reduce(mergeSchemaPart, {
    resolvers: {},
    schemaDirectives: {},
    typeDefs: [rootTypes]
  });
}

export function makeExecutableSchema(
  schemaParts: SchemaPart[],
  options?: object
): GraphQLSchema {
  const combinedSchema = combineSchemaDefinitions(schemaParts);
  return baseMakeExecutableSchema({ ...combinedSchema, ...options });
}
