import { defaultFieldResolver, GraphQLString } from 'graphql';
import { SchemaDirectiveVisitor } from 'graphql-tools';

class UpperCaseDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;

    field.resolve = async function(source, args, context, info) {
      const value = await resolve.call(this, source, args, context, info);

      return value.toUpperCase();
    };

    field.type = GraphQLString;
  }
}

export const schemaDirectives = {
  upperCase: UpperCaseDirective
};

export const typeDefs = 'directive @upperCase on FIELD_DEFINITION';
