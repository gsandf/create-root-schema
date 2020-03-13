export const typeDefs = /* GraphQL */ `
  type User {
    lastSeen: Timestamp
    name: String
  }

  extend type Mutation {
    seen(id: ID!): User
  }

  extend type Query {
    user(id: ID!): User
    users: [User]
  }
`;

const testUsers = [
  { id: 'VG9tIEJvbWJhZGlsCg==', lastSeen: 0, name: 'Tom Bombadil' },
  { id: 'QXJhZ29ybgo=', lastSeen: 0, name: 'Aragorn' }
];

export const resolvers = {
  Mutation: {
    seen: (_, { id }) => {
      const user = testUsers.find(user => user.id === id);
      user.lastSeen = Date.now();
      return user;
    }
  },
  Query: {
    user: (_, { id }) => testUsers.find(user => user.id === id),
    users: () => testUsers
  }
};
