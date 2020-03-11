# create-root-schema

> 🌿 Combines schemas and types to help you modularize your GraphQL service

GraphQL is awesome, but there isn't yet a standardized way to break up schemas
in a way that makes sense. By enforcing a simple standard (exporting certain variables) on all your schema
files, you can break the service up in a way that makes sense for your project.

We believe this system allows you to make very few boilerplate changes to extend
your service while also being very explicit—we don't like unnecessary magic.

ℹ️ This is just a very thin wrapper extending/replacing [`makeExecutableSchema`](https://www.apollographql.com/docs/graphql-tools/generate-schema/).
See [`graphql-tools`](https://www.apollographql.com/docs/graphql-tools/) for more documentation.

## Usage

All your schema files can export `typeDefs`, `resolvers`, and
`schemaDirectives`. All are optional.

To add functionality, each file may:

- Extend a root type: `Query` and/or `Mutation`
- Add or extend custom typesD
- Add resolvers for the types
- Add a custom scalar/enum
  - [Example usage](./src/testHelpers/schemas/timestamp.js)
  - Read the [`graphql-tools`
    documentation](https://www.apollographql.com/docs/graphql-tools/scalars/)
    more more information
- Add a custom schema directive
  - [Example usage](./src/testHelpers/schemas/upperCase.js)
  - Read the [`graphql-tools`
    documentation](https://www.apollographql.com/docs/apollo-server/schema/directives/)
    more more information

```js
// Example Users schema file
import { fetchUser, fetchUsers } from './users';

export const typeDefs = /* GraphQL */ `
  type User {
    lastSeen: Timestamp
    name: String
  }

  # Extend the root types to expose logic...
  extend type Query {
    user(id: ID!): User
    users: [User]
  }
`;

export const resolvers = {
  Query: {
    user: (_, { id }) => fetchUser(id),
    users: () => fetchUsers()
  }
};
```

Then, import the schema parts into a single file and create a root schema:

```js
import {
  combineSchemaDefinitions,
  makeExecutableSchema
} from 'create-root-schema';

import * as device from './device';
import * as notification from './notification';
import * as user from './user';

// NOTE: Choose one of these options…

// - option 1: get the combined schema:
export default combineSchemaDefinitions([device, notification, user]);

// - option 2: both combine the schema and convert to an executable schema:
export default makeExecutableSchema([device, notification, user]);
```

### Usage with [`apollo-server-express` v2](https://github.com/apollographql/apollo-server)

```js
// ./schemas/index.js
import { combineSchemaDefinitions } from 'create-root-schema';

import * as device from './device';
import * as notification from './notification';
import * as user from './user';

export default combineSchemaDefinitions([brand, device, notification, user]);
```

```js
// ./index.js
import { ApolloServer, gql } from 'apollo-server-express';
import express from 'express';
import schema from './schemas';

const app = express();

const server = new ApolloServer(schema);

server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);
```

### Usage with [`graphql-yoga`](https://github.com/prisma-labs/graphql-yoga)

```js
// ./schemas/index.js
import { combineSchemaDefinitions } from 'create-root-schema';

import * as device from './device';
import * as notification from './notification';
import * as user from './user';

export default combineSchemaDefinitions([brand, device, notification, user]);
```

```js
import { GraphQLServer } from 'graphql-yoga';
import schema from './schemas';

const server = new GraphQLServer(schema);
server.start(() => console.log('Server is running on localhost:4000'));
```

### Extra Options

This is just a thin wrapper around [`makeExecutableSchema`](https://www.apollographql.com/docs/graphql-tools/generate-schema/). Any options passed as the second argument will be forwarded directly to `makeExecutableSchema`.

```js
import { makeExecutableSchema } from 'create-root-schema';

// See `graphql-tools` docs for more information
makeExecutableSchema([...schemas], { allowUndefinedInResolve: false });
```

## Install

With [Yarn](https://yarnpkg.com/) or [npm](https://npmjs.org/) installed, run:

```
yarn add create-root-schema

# ...or, if using `npm`
npm install create-root-schema
```

## License

MIT
