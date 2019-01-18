import { driver } from "./driver";
import { schema } from "./schema"
import { ApolloServer } from "apollo-server";

/*
 * Create a new ApolloServer instance, serving the GraphQL schema
 * created using makeAugmentedSchema above and injecting the Neo4j driver
 * instance into the context object so it is available in the
 * generated resolvers to connect to the database.
 */
const server = new ApolloServer({
  schema: schema,
  context: { driver },
  allowUndefinedInResolve: true
});

/*
 * Start Apollo server
 */
server.listen(process.env.GRAPHQL_LISTEN_PORT, "0.0.0.0").then(({ url }) => {
  console.log(`GraphQL API ready at ${url}`);
});
