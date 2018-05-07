# create-root-schema

> 🌿 Combines schemas and types to help you modularize your GraphQL service

GraphQL is awesome, but there isn't yet a standardized way to break up schemas
in a way that makes sense. By enforcing a simple standard (exporting certain variables) on all your schema
files, you can break the service up in a way that makes sense for your project.

We believe this system allows you to make very few boilerplate changes to extend
your service while also being very explicit—we don't like unnecessary magic.

ℹ️ This is just a very thin wrapper extending/replacing [`makeExecutableSchema`](https://www.apollographql.com/docs/graphql-tools/generate-schema.html).
See [`graphql-tools`](https://www.apollographql.com/docs/graphql-tools/) for more documentation.

## Usage

First, all your schema files can export `type` and `resolvers` (both are optional).
To add functionality, each file may:

* extend one of the root types (i.e. `Query` and/or `Mutation`)
* extend another custom type
* add resolvers to one of the root types
* extend resolvers of a custom type
* add a custom scalar/enum. See [`graphql-tools` docs](https://www.apollographql.com/docs/graphql-tools/scalars.html) for more info or [`timestamp.js`](./src/testHelpers/schemas/timestamp.js) for an example.

```js
// Example Users schema file
import users from './users';

export const type = /* GraphQL */ `
  type User {
    lastSeen: Timestamp
    name: String
  }

  # Just extend the root types to expose logic...
  extend type Mutation {
    seen (id: ID!): User
  }

  extend type Query {
    user(id: ID!): User
    users: [User]
  }
`;

export const resolvers = {
  Mutation: {
    seen: (_, { id }) => {
      const user = userList.findById(id);
      user.lastSeen = Date.now();
      return user;
    }
  },
  Query: {
    user: (_, { id }) => users.findById(id)
  }
};
```

Then, import whatever files used into a single file and create the root schema:

```js
import createRootSchema from 'create-root-schema';

import * as brand from './brand';
import * as device from './device';
import * as notification from './notification';
import * as user from './user';

export default createRootSchema([brand, device, notification, user]);
```

As an alternative, you may opt to use a package that requires all matching files.
That should work fine; we've just opted to be explicit here.

### Usage with a Server

We use `apollo-server-express`, but any Node.js server should be similar:

```js
// ./schemas/index.js
import createRootSchema from 'create-root-schema';

import * as brand from './brand';
import * as device from './device';
import * as notification from './notification';
import * as user from './user';

export default createRootSchema([brand, device, notification, user]);
```

```js
// ./index.js
import { graphqlExpress } from 'apollo-server-express';
import schema from './schemas';

app.use('/graphql', graphqlExpress(req => ({ schema })));
```

### Separate Files

Sometimes types & resolvers make sense broken out into more files. You can do
this however you like. Here's one possibility:

```graphql
# ./schemas/product/type.graphql

type Product {
  id: ID!
  name: String
  stock: Int
  #
  # ...so many fields
  #
}
```

```js
// ./schemas/product/index.js

// using something like `babel-plugin-inline-import`
import userType from './type.graphql';

export const type = userType;

export const resolvers = {
  // ...
};
```

### Extra Options

This is just a thin wrapper around [`makeExecutableSchema`](https://www.apollographql.com/docs/graphql-tools/generate-schema.html). Any options passed as the second argument will be forwarded directly to `makeExecutableSchema`.

```js
import createRootSchema from 'create-root-schema';

// See `makeExecutableSchema` docs for more information
createRootSchema([...schemas], { allowUndefinedInResolve: false });
```

## Install

With [Yarn](https://yarnpkg.com/) or [npm](https://npmjs.org/) installed, run:

```
yarn add create-root-schema

# ...or, if using `npm`
npm install create-root-schema
```

## See Also

* [`okgrow/merge-graphql-schemas`](https://github.com/okgrow/merge-graphql-schemas) - A utility library to facilitate merging of modularized GraphQL schemas and resolver objects.

## License

MIT
