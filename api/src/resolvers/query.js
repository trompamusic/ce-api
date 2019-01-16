import { driver } from "../driver";
import { neo4jgraphql, cypherQuery } from "neo4j-graphql-js";

export const queryResolvers = {
  Query: {
    // LegalPerson(object, params, ctx, resolveInfo) {
    //   console.log('Query LegalPerson');
    //   console.log(params);
    //   let session = driver.session();
    //   let query = "MATCH (`person`:`Person`) RETURN `person` { .name }";
    //
    //   let promise = session.run(query, params)
    //     //.then( result => { return result;})
    //     .then( result => { console.log(result); return result.records.map(record => { console.log(record.get("person")); record.get("person").properties })})
    //     .catch(function (error) {console.log(error);});
    //
    //   session.close();
    //
    //   console.log(promise);
    //
    //   return promise;
    //
    //
    //   // console.log(object);
    //   // console.log(params);
    //   // console.log(ctx);
    //   //console.log(resolveInfo.schema._possibleTypeMap.LegalPerson);
    //
    //   // return "MATCH (`person`:`Person` {identifier:$identifier}) RETURN `person` { .name } AS `person` SKIP $offset\n" +
    //   //   "{ offset: 0,\n" +
    //   //   "  first: -1,\n" +
    //   //   "  identifier: '2eddab66-a20c-4b66-bdbe-294cebe916e1' }";
    //
    //   let generatedQuery = neo4jgraphql(object, params, ctx, resolveInfo);
    //   console.log(generatedQuery);
    //   console.log('before return');
    //   return generatedQuery;
    //   //
    //   //
    //   // let unionQuery = "MATCH (`person`:`Person` {identifier:$identifier}) RETURN `person` { .name } AS `person` " +
    //   //   "UNION MATCH (`organization`:`Organization` {identifier:$identifier}) RETURN `organization` { .name } AS `organization` "
    //   //   "SKIP $offset " +
    //   //   "{ offset: 0, " +
    //   //   "first: -1, " +
    //   //   "identifier: '2eddab66-a20c-4b66-bdbe-294cebe916e1' }"
    //   //
    //   // return unionQuery;
    //
    //   // console.log(neo4jgraphql(object, params, ctx, resolveInfo));
    //   // let cypherQuery = neo4jgraphql.cypherQuery(params, resolveInfo, ctx);
    //   // console.log(cypherQuery);
    //   // let generatedQuery = neo4jgraphql(object, params, ctx, resolveInfo);
    //   // console.log(generatedQuery);
    //
    //   // return generatedQuery;}
    // },
  }
}
