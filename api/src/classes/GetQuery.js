// GetQuery.js
"use strict"

import { lowercaseFirstCharacter } from "../resolvers";

class GetQuery {

  constructor (params, resolveInfo) {
    this.params = params;
    this.resolveInfo = resolveInfo;

    this.schema = resolveInfo.schema;
    this.baseNode = this.resolveInfo.fieldNodes[0];
    this.baseType = this.baseNode.name.value;
  }

  get query() {
    return this.generateQuery();
  }

  generateQuery() {
    // retrieve constants from parameters
    const alias = lowercaseFirstCharacter(this.resolveInfo.fieldName);

    // construct query
    // let query = "MATCH (`" + alias + "`:`" + this.baseType + "` {}) WITH `" + alias + "`, HEAD(labels(`" + alias + "`)) as _schemaType RETURN `" + alias + "` {_schemaType, " + selectionSetClause(this.baseType, alias, this.baseNode.selectionSet) + "}";

    let query = "MATCH (`musicComposition`:`MusicComposition` {}) WITH `musicComposition`, HEAD(labels(`musicComposition`)) as _schemaType RETURN `musicComposition` {_schemaType, .identifier , .name, firstPerformance: HEAD([(`musicComposition`)-[:`FIRST_PERFORMANCE`]->(`musicComposition_firstPerformance`:`Event`) | {`_schemaType`:HEAD(labels(`musicComposition_firstPerformance`)), `identifier`:`musicComposition_firstPerformance`.`identifier`, `name`:`musicComposition_firstPerformance`.`name`}]) }  AS `musicComposition`";

    return query
  }

  selectionSetClause (parentType, parentAlias, selectionSet) {
    // const [selectionSet] = sets;
    // console.log('selectionSetClause, selectionSet:');
    // console.log(selectionSet);
    let properties = ['_schemaType'];
    switch(selectionSet.kind){
      case "SelectionSet":
        selectionSet.selections.map(selection => {
          console.log('selection:');
          console.log(selection);
          switch(selection.kind){
            case "Field":
              console.log('selection.kind Field encountered');
              if(selection.selectionSet === undefined){
                properties.push("." + selection.name.value);
              } else {
                // this is a deeper node with its own properties - recurse
                properties.push(embeddedNodeClause(parentType, parentAlias, selection));
              }
              break;
            default:
              console.log('unknown selection Kind encountered: ' + selection.kind);
          }
        });
        break;
      default:
        console.log('unknown selectionSet kind encountered: ' + selectionSet.kind);
    }

    console.log('properties:');
    console.log(properties.join(', '));
    let clause = properties.join(', ');

    return clause;
  }

  embeddedNodeClause (parentType, parentAlias, selection, schema) {
    console.log(selection);
    console.log(schema);
    const alias = parentAlias + "_" + selection.name.value;
    const relation = findRelation(parentType, selection.name.value);
    console.log(relation);
    //const relationType =

    // TODO interpret arrayed/non arrayed relation properties (HEAD)
    let clause = selection.name.value + ":HEAD([(`" + parentAlias + "`)-[:`Event`]->(`" + alias + "`:`Event`) | {`_schemaType`:HEAD(labels(`" + alias + "`)), `identifier`:`" + alias + "`.`identifier`, `name`:`" + alias + "`.`name`}]) ";


    return clause;
  }

  findRelation () {

  }
}

export default GetQuery;