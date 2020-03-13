import { GraphQLScalarType, Kind } from 'graphql';

export const typeDefs = /* GraphQL */ `
  scalar Timestamp
`;

const coerceToDate = value => {
  const dateValue = new Date(
    /\d{4}-\d{2}-\d{2}/.test(value) ? value : parseInt(value)
  );

  if (Number.isNaN(dateValue.getTime())) {
    throw new TypeError(`Cannot represent value as timestamp: ${value}`);
  }

  return dateValue;
};

export const resolvers = {
  Timestamp: new GraphQLScalarType({
    description: 'Timestamp custom scalar type',
    name: 'Timestamp',
    parseLiteral(ast) {
      if (ast.kind === Kind.INT || ast.kind === Kind.String) {
        // ast value is always in string format
        return coerceToDate(ast.value);
      }
      return null;
    },
    parseValue: coerceToDate,
    serialize: value => {
      if (value instanceof Date) return value.getTime();
      if (typeof value === 'number') return value;
      if (typeof value === 'string') return new Date(value).getTime();
      throw new TypeError(`Cannot represent value as timestamp: ${value}`);
    }
  })
};
