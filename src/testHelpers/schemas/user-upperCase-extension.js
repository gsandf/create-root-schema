const typeDefs = /* GraphQL */ `
  extend type User {
    nameUpper: String @upperCase
  }
`;

const resolvers = {
  User: {
    nameUpper: user => user.name
  }
};

export { resolvers, typeDefs };
