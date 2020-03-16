
# Authenticating with the CE-API  
  
All read operations in the Contributor Environment API are publicly accessible. However, in order to create, update, or delete nodes, the request **MUST BE** authenticated with a JWT token.

## Request a JWT token

The Contributor Environment API has an endpoint to create a JWT token. This endpoint **MUST ONLY** be used in a secured environment since it uses a private API key which shouldn't be visible to users. Best practice for web applications is to request the JWT token in a backend environment and to only use the JWT token in the frontend.

### JWT Endpoint

For test environment use:

`https://api-test.trompamusic.eu/jwt`

For production environment use:

`https://api.trompamusic.eu/jwt`

> **NOTE:** API keys are not shared between the test and production environments. Each environment will have its own unique API keys.

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

### Expiration time

Each generated JWT token can be used until the expiration time is reached. Currently, the expiration is set to `1d` which means the token can be used for 24 hours from the time of requesting.

The expiration time can be read from the JWT token by decoding it using the `jsonwebtoken` dependency like so:

```js
import * as jwt from 'jsonwebtoken'

try {
  const token = jwt.decode('your-jwt-token')

  const expirationInMs = token.exp * 1000
  const time = Date.now()

  if (time > expirationInMs) {
    // the token has expired
  } else {
    // the token is valid
  }
} catch (error) {
  console.log(`Error parsing the JWT token: ${error.message}`)
}
```     

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

The Contributor Environment API will obtain the token from the `Authorization` header with type `Bearer` for authentication. Make sure that this header is set for each request that needs authentication.

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

![GraphQL Headers](../img/graphql-headers.png)

## Environment variables

The CE-API uses environment variables to configure the jwt secret key, expiration, auth keys, and issuer.

### JWT_SECRET

The generated JWT tokens are generated and validated with the configured JWT secret. This is a generated string and should be unique for each environment. You can change the JWT secret by setting the `JWT_SECRET` environment variable.

### JWT_EXPIRES

Control how long a JWT token is valid until expiring. The `JWT_EXPIRES` environment variable accepts a number of seconds or a time span which is parsed by the [zeit/ms](https://github.com/zeit/ms) package.

### JWT_ISSUER

Currently not being used, but it is recommended by the JWT protocol.

### JWT_AUTH_KEYS

Each client has an unique auth key which can be used to request a JWT token. This auth key is configured in the `JWT_AUTH_KEYS` environment variable. The value should be a collection with the following properties: id, apiKey and scopes.

For example:

```json
[{ 
  "id": "client-id", 
  "apiKey": "jfBeQsMWo5y3AX1MaN8Vvzkkmkx2TUpVYohpwDXf6ck=",   
  "scopes": ["*"]
}]
```

### Adding a new auth key

#### id

First, you should decide what the id should be which will be associated with the auth key. This can be the common name of the company or person. E.g. our company name is `Video Dock B.V.`, so we will be using `videodock` for the id property.

#### apiKey

The apiKey is the **secret** key that only should be handed to the auth key owner in a secure way. Any string can be used for the apiKey, but we recommend using random generated string of characters. 

If you have `openssl` installed, you can use the following command to generate a token: 

```shell script
$ openssl rand -base64 32
```

#### scopes

The scopes property is an Array of strings which is being used to whitelist scopes for that auth key. This property should contain at least a single scope in order to work.

If all scopes are allowed for the given auth key, you can use a wildcard like so:

```json
{
  "scopes": ["*"]
}
```

If an auth key should only have access to create/edit/delete persons in the Contributor Environment, you can use the following scopes:

```json
{
  "scopes": [
    "mutation:CreatePerson",
    "mutation:UpdatePerson",
    "mutation:DeletePerson"
  ]
}
``` 
