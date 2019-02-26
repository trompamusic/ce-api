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
    this.bracketRegEx = new RegExp("^\\[.*?\\]$");
  }

  get query() {
    return this._generateQuery();
  }

  _generateQuery() {
    // retrieve constants from parameters
    const alias = lowercaseFirstCharacter(this.resolveInfo.fieldName);

    // generate base query
    let queryString = "MATCH (`" + alias + "`:`" + this.baseType + "` {}) WITH `" + alias + "`, HEAD(labels(`" + alias + "`)) as _schemaType RETURN `" + alias + "` {" + this._selectionSetClause(this.baseType, alias, this.baseNode.selectionSet) + "}";

    // conclude query
    queryString += " AS `" + alias + "`";
    if(this.params.hasOwnProperty('offset') && this.params.offset > 0){
      queryString += ' SKIP ' + this.params.offset;
    }
    if(this.params.hasOwnProperty('first') && this.params.first > 0){
      queryString += ' LIMIT ' + this.params.first;
    }

    // queryString = "MATCH (`musicComposition`:`MusicComposition` {}) WITH `musicComposition`, HEAD(labels(`musicComposition`)) as _schemaType RETURN `musicComposition` {_schemaType, .identifier, .name, firstPerformance: HEAD([(`musicComposition`)-[:`FIRST_PERFORMANCE`]->(`musicComposition_firstPerformance`:`Event`) | {`_schemaType`:HEAD(labels(`musicComposition_firstPerformance`)), `identifier`:`musicComposition_firstPerformance`.`identifier`, `name`:`musicComposition_firstPerformance`.`name`}]) }  AS `musicComposition`";

    return queryString;
  }

  _selectionSetClause (parentType, parentAlias, selectionSet) {
    let properties = ["`_schemaType`:HEAD(labels(`"+parentAlias+"`))"];
    switch(selectionSet.kind){
      case "SelectionSet":
        selectionSet.selections.map(selection => {
          switch(selection.kind){
            case "Field":
              if(typeof selection.selectionSet === 'object' && selection.selectionSet !== null){
                // this is a deeper node with its own properties - recurse
                properties.push(this._embeddedNodeClause(parentType, parentAlias, selection));
              } else {
                properties.push("`"+selection.name.value+"`:`"+parentAlias+"`.`"+selection.name.value+"`");
              }
              break;
            default:
              console.log('unknown selection kind encountered: ' + selection.kind);
          }
        });
        break;
      default:
        console.log('unknown selectionSet kind encountered: ' + selectionSet.kind);
    }

    let clause = properties.join(', ');

    return clause;
  }

  _embeddedNodeClause (parentType, parentAlias, selection, schema) {
    const alias = parentAlias + "_" + selection.name.value;
    const propertyType = this._findPropertyType(parentType, selection.name.value);
    const relationName = this._retrievePropertyTypeRelationName(propertyType);

    // retrieve property name without brackets
    let propertyTypeName = propertyType.type.toString();
    if(true === this.bracketRegEx.test(propertyTypeName)){
      propertyTypeName = propertyTypeName.slice(1,-1);
    }

    // TODO interpret arrayed/non arrayed relation properties (HEAD)
    // let clause = selection.name.value + ": HEAD([(`" + parentAlias + "`)-[:`"+relationName+"`]->(`" + alias + "`:`"+propertyType.type+"`) | {`_schemaType`:HEAD(labels(`" + alias + "`)), `identifier`:`" + alias + "`.`identifier`, `name`:`" + alias + "`.`name`}]) ";
    let clause = selection.name.value + ": HEAD([(`" + parentAlias + "`)-[:`"+relationName+"`]->(`" + alias + "`:`"+propertyTypeName+"`) | {" + this._selectionSetClause(propertyTypeName, alias, selection.selectionSet) + "}]) ";

    return clause;
  }

  _findPropertyType (parentType, propertyName) {
    const typeMap = this.schema._typeMap[parentType];
    if(typeof typeMap === 'undefined'){
      throw Error('Type could not be retrieved from schema');
    }

    const propertyType = typeMap._fields[propertyName];
    if(typeof propertyType === 'undefined'){
      throw Error('Property type could not be retrieved from schema');
    }

    // remove array-brackets

    return propertyType;
  }

  _retrievePropertyTypeRelationName (propertyType) {
    let relationName = null;

    const directives = propertyType.astNode.directives;
    if(false === directives instanceof Array){
      throw Error('Type property directives could not be retrieved from schema');
    }

    for (let di = 0; di < directives.length; di++) {
      const directive = directives[di];
      if(directive.name.value === 'relation'){
        const directiveArguments = directive.arguments;
        directiveArguments.map(directiveArgument => {
          if(directiveArgument.kind == 'Argument' && directiveArgument.name.value == 'name'){
            relationName = directiveArgument.value.value;
          }
        });
        if(relationName !== null){
          break;
        }
      }
    }

    return relationName;
  }
}

export default GetQuery;