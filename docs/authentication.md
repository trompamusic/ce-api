
# Authenticating with the CE-API  
  
All read operations in the Contribution Environment API are publicly accessible for everyone. However, in order to create, update, or delete nodes, the request must be authorized with a JWT token.

## Request a JWT token

The Contribution Environment API has an endpoint to create a JWT token. This endpoint **MUST ONLY** be used in a secured environment since it uses a private API key which shouldn't be visible to users. Best practice for web applications is to request the JWT token in a backend environment and to only use the JWT token in the frontend.

### JWT Endpoint

For test environment use:

`https://api-test.trompamusic.eu/jwt`

For production environment use:

`https://api.trompamusic.eu/jwt`

> **NOTE:** API keys are not exchangeable between the test and production environment. Each environment will have its own unique API keys.

### Parameters

In order to obtain a JWT token you will need to have the following information:

| Parameter | Type | Description |
| -- | -- | -- |
| id | String | This will identity your token (like a username) |
| apiKey | String | This is your secret API key (like a password) |
| scopes | String[] | A list of scopes for the required operations and types |

> The `id` and `apiKey` can be requested from one of the TROMPA project partners.

### Scopes

When requesting a JWT token, you can determine to which resources the token has access to. For example, if you only need to create a Person in the client side code, the following scope will only allow the client side code to create a person: `"scopes": ["Mutation:CreatePerson"]` 

The scope pattern uses the `Operation` and `Fieldname` with a Colon ":" in between. Globs are also supported to make it easier to obtain access to multiple resources or while developing. If you need access to all `Create` operations, you could use the following scopes: `"scopes": ["Mutation:Create*"]`

### Response

If the authentication is successfull the API will give the following JSON response:

```json
{
  "success": true,
  "jwt": "xxxxxxxxxxx.xxxxxxxxxxxx.xxxxxxxxxxx"
}
```

### NodeJS example

```js
var request = require('request');  
var options = {  
  'method': 'POST',  
  'url': 'https://api-test.trompamusic.eu/jwt',  
  'headers': {  
  'Content-Type': 'application/json'  
  },
  body: JSON.stringify({  
  id: 'public',  
  apiKey: 'readonly',  
  scopes: ['Query:ControlAction']  
 })};  
  
request(options, function (error, response) {  
  if (error) throw new Error(error);  
  
  const body = JSON.parse(response.body);  
  
  // body.jwt is the JWT token
  console.log(body.jwt);  
});

```

## Use the JWT token

### Authorization header

The Contribution Environment API will obtain the token from the `Authorization` header with type `Bearer` for authentication. Make sure that this header is set for each request that needs authentication.

For example:

```
POST /graphql HTTP/1.1
Host: api-test.trompamusic.eu
Authorization: Bearer xxxxxxxx.xxxxxxxx.xxxxxxxx
```

### Apollo

In Apollo (client) you can set the authorization header in each request with the following code:

```js
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';

const httpLink = createHttpLink({
  uri: '/graphql',
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});
```

Read more in the [Apollo documentation](https://www.apollographql.com/docs/react/networking/authentication/#header).

### GraphQL Playground

In the GraphQL playground, you can manually add the `Authorization` header in the bottom left tab "HTTP HEADERS".

```
{
  "Authorization": "Bearer <token>"
}
```

![GraphQL Headers](../img/graphql-playground.png)
