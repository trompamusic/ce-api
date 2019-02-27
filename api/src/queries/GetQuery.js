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

  _generateQuery () {
    // retrieve constants from parameters
    const alias = lowercaseFirstCharacter(this.resolveInfo.fieldName);

    // generate base query
    let queryString = "MATCH (`" + alias + "`:`" + this.baseType + "` {}) WITH `" + alias + "`, HEAD(labels(`" + alias + "`)) as _schemaType RETURN `" + alias + "` {" + this._selectedPropertiesClause(this.baseType, alias, this.baseNode.selectionSet) + "}";

    // conclude query
    queryString += " AS `" + alias + "`";
    if(this.params.hasOwnProperty('offset') && this.params.offset > 0){
      queryString += ' SKIP ' + this.params.offset;
    }
    if(this.params.hasOwnProperty('first') && this.params.first > 0){
      queryString += ' LIMIT ' + this.params.first;
    }

    return queryString;
  }

  _selectedPropertiesClause (parentType, parentAlias, selectionSet) {
    let properties = ["`_schemaType`:HEAD(labels(`"+parentAlias+"`))"];

    if (selectionSet.kind !== 'SelectionSet') {
      throw Error('Property clause generation needs a selectionSet');
    }

    // TODO distinguish between Root, Interface and Union types

    selectionSet.selections.map(selection => {
      switch (selection.kind) {
        case "Field":
          // weed out selections for Unions and Interfaces (will be handled in 'InlineFragment case')
          // console.log(this.schema);

          if (typeof selection.selectionSet === 'object' && selection.selectionSet !== null) {
            // this is a deeper node with its own properties - recurse
            console.log('deeper node');
            const nodeClause = this._selectionSetNodeClause(parentType, parentAlias, selection);
            if (typeof nodeClause === 'string') {
              properties.push(nodeClause);
            }
          } else {
            properties.push("`" + selection.name.value + "`:`" + parentAlias + "`.`" + selection.name.value + "`");
          }
          break;
        case 'InlineFragment':
          console.log('InlineFragment encountered');
          // properties.push(this._inlineFragmentNodeClause(parentType, parentAlias, selection));
          break;
          default:
            console.log('unknown selection kind encountered: ' + selection.kind);
      }
    });

    let clause = properties.join(', ');

    return clause;
  }

  _selectionSetNodeClause (parentType, parentAlias, selection) {
    const alias = parentAlias + "_" + selection.name.value;
    const propertyType = this._findPropertyType(parentType, selection.name.value);

    // determine property has single or multiple values
    let propertyTypeName = propertyType.type.toString();
    let isPropertyTypeCollection = false;
    if (true === this.bracketRegEx.test(propertyTypeName)) {
      propertyTypeName = propertyTypeName.slice(1,-1);
      isPropertyTypeCollection = true;
    }

    // determine property is of implementation type (Union or Interface)
    const implementationType = this.schema._implementations[propertyTypeName];
    if (typeof implementationType === 'object') {
      return null;
    }

    const relationDetails = this._retrievePropertyTypeRelationDetails(propertyType);

    let clause = selection.name.value + ": " + (isPropertyTypeCollection ? "" : "HEAD(") + "[(`" + parentAlias + "`)" + this._relationClause(relationDetails) + "(`" + alias + "`:`" + propertyTypeName + "`) | {" + this._selectedPropertiesClause(propertyTypeName, alias, selection.selectionSet) + "}]" + (isPropertyTypeCollection ? "" : ")") + " ";

    return clause;
  }

  _inlineFragmentNodeClause (parentType, parentAlias, selection) {
    console.log('_inlineFragmentNodeClause() called');
    console.log('selection:');
    console.log(selection);

    // const alias = parentAlias + "_" + selection.name.value;
    const propertyTypeName = selection.typeCondition.name.value;
    console.log('propertyTypeName:');
    console.log(propertyTypeName);



    const propertyType = this._findPropertyType(parentType, propertyTypeName);
    console.log('propertyType:');
    console.log(propertyType);

    // const relationDetails = this._retrievePropertyTypeRelationDetails(propertyType);




    // console.log(propertyType);
    // const relationDetails = this._retrievePropertyTypeRelationDetails(propertyType);
    // let isPropertyTypeCollection = false;
  }

  _relationClause (relationDetails) {
    let clause = "-[:`" + relationDetails['name'] + "`]-";

    switch (relationDetails['direction'].toString().toUpperCase()) {
      case 'OUT':
        clause += ">";
        break;
      case 'IN':
        clause = "<" + clause;
        break;
      case "BOTH":
        clause = "<" + clause + ">";
        break;
      default:
        throw Error('Unknown relation direction encountered');
    }

    return clause;
  }

  _findPropertyType (parentType, propertyName) {
    console.log('_findPropertyType() called');
    const typeMap = this.schema._typeMap[parentType];
    if (typeof typeMap === 'undefined') {
      throw Error('Type could not be retrieved from schema');
    }

    const propertyType = typeMap._fields[propertyName];
    if (typeof propertyType === 'undefined') {
      throw Error('Property type could not be retrieved from schema');
    }

    return propertyType;
  }

  _retrievePropertyTypeRelationDetails (propertyType) {
    let relationDetails = {};

    const directives = propertyType.astNode.directives;
    if (false === directives instanceof Array) {
      throw Error('Type property directives could not be retrieved from schema');
    }

    for (let di = 0; di < directives.length; di++) {
      const directive = directives[di];
      if (directive.name.value === 'relation') {
        const directiveArguments = directive.arguments;
        directiveArguments.map(directiveArgument => {
          if (directiveArgument.kind == 'Argument') {
            switch (directiveArgument.name.value.toString()) {
              case 'name':
                relationDetails.name = directiveArgument.value.value;
                break;
              case 'direction':
                relationDetails.direction = directiveArgument.value.value;
                break;
              default:
                // do nothing
            }
          }
        });
        if (Object.keys(relationDetails).length >= 1) {
          break;
        }
      }
    }

    return relationDetails;
  }
}

export default GetQuery;