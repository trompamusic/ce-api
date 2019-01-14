import { driver } from "../driver";
import { neo4jgraphql } from "neo4j-graphql-js";

export const queryResolvers = {
  Query: {
    LegalPerson(object, params, ctx, resolveInfo) {
      let session = driver.session
      // console.log(object);
      // console.log(params);
      // console.log(ctx);
      //console.log(resolveInfo.schema._possibleTypeMap.LegalPerson);

      // return "MATCH (`person`:`Person` {identifier:$identifier}) RETURN `person` { .name } AS `person` SKIP $offset\n" +
      //   "{ offset: 0,\n" +
      //   "  first: -1,\n" +
      //   "  identifier: '2eddab66-a20c-4b66-bdbe-294cebe916e1' }";

      let generatedQuery = neo4jgraphql(object, params, ctx, resolveInfo);
      console.log(generatedQuery);
      console.log('before return');
      return generatedQuery;
      //
      //
      // let unionQuery = "MATCH (`person`:`Person` {identifier:$identifier}) RETURN `person` { .name } AS `person` " +
      //   "UNION MATCH (`organization`:`Organization` {identifier:$identifier}) RETURN `organization` { .name } AS `organization` "
      //   "SKIP $offset " +
      //   "{ offset: 0, " +
      //   "first: -1, " +
      //   "identifier: '2eddab66-a20c-4b66-bdbe-294cebe916e1' }"
      //
      // return unionQuery;

      // console.log(neo4jgraphql(object, params, ctx, resolveInfo));
      // let cypherQuery = neo4jgraphql.cypherQuery(params, resolveInfo, ctx);
      // console.log(cypherQuery);
      // let generatedQuery = neo4jgraphql(object, params, ctx, resolveInfo);
      // console.log(generatedQuery);

      // return generatedQuery;}
    },
  }
}
