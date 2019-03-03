// GetQuery.js
"use strict"

import StringHelper from "../helpers/StringHelper";
import SchemaHelper from "../helpers/SchemaHelper";

class GetQuery {

  constructor (params, resolveInfo) {
    this.params = params;
    this.resolveInfo = resolveInfo;

    this.schemaHelper = new SchemaHelper(resolveInfo.schema);
    this.baseNode = this.resolveInfo.fieldNodes[0];
    this.baseType = this.baseNode.name.value;
    this.bracketRegEx = new RegExp("^\\[.*?\\]$");
  }

  get query() {
    return this._generateQuery();
  }

  _generateQuery () {
    // retrieve constants from parameters
    const alias = StringHelper.lowercaseFirstCharacter(this.resolveInfo.fieldName);

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
    let propertyClauses = ["`_schemaType`:HEAD(labels(`"+parentAlias+"`))"];

    if (selectionSet.kind !== 'SelectionSet') {
      throw Error('Property clause generation needs a selectionSet');
    }

    selectionSet.selections.map(selection => {
      switch (selection.kind) {
        case "Field":
          const nodeClause = this._selectedPropertyClause (parentType, parentAlias, selection);
          if (typeof nodeClause === 'string') {
            propertyClauses.push(nodeClause);
          }
          break;
        case 'InlineFragment':
          if (selection.typeCondition.kind === 'NamedType' && selection.typeCondition.name.value === parentType) {
            selection.selectionSet.selections.map(namedTypeSelection => {
              const nodeClause = this._selectedPropertyClause (parentType, parentAlias, namedTypeSelection);
              if (typeof nodeClause === 'string') {
                propertyClauses.push(nodeClause);
              }
            });
          }
          break;
          default:
            console.log('unknown selection kind encountered: ' + selection.kind);
      }
    });

    let clause = propertyClauses.join(', ');

    return clause;
  }

  _selectedPropertyClause (parentType, parentAlias, selection) {
    let propertyClause = null;

    if (typeof selection.selectionSet === 'object' && selection.selectionSet !== null) {
      // this is a deeper node with its own properties - recurse
      propertyClause = this._selectionSetNodeClause(parentType, parentAlias, selection);
    } else {
      const propertyName = selection.name.value.toString();
      // ignore library private properties, indicated with __ prefix, like __typename
      if (propertyName.substring(0,2) !== '__') {
        propertyClause = "`" + selection.name.value + "`:`" + parentAlias + "`.`" + selection.name.value + "`";
      }
    }

    return propertyClause;
  }

  _selectionSetNodeClause (parentType, parentAlias, selection) {
    const alias = parentAlias + "_" + selection.name.value;
    const propertyType = this.schemaHelper.findPropertyType(parentType, selection.name.value);

    // determine property is single or array of values
    let propertyTypeName = propertyType.type.toString();
    let isPropertyTypeCollection = false;
    if (true === this.bracketRegEx.test(propertyTypeName)) {
      propertyTypeName = propertyTypeName.slice(1,-1);
      isPropertyTypeCollection = true;
    }

    const relationDetails = SchemaHelper.retrievePropertyTypeRelationDetails(propertyType);

    // determine propertyType represents either possible Union types or Interface implementations
    let representsMultipleTypes = this.schemaHelper.findInterfaceImplementingTypes(propertyTypeName);
    if (false === representsMultipleTypes instanceof Array) {
      representsMultipleTypes = this.schemaHelper.findPossibleTypes(propertyTypeName);
    }

    // start clause
    let clause = selection.name.value + ": " + (isPropertyTypeCollection ? "" : "HEAD(");

    if (representsMultipleTypes instanceof Array) {
      // if Union or Interface type: generate subquery for each represented Type
      clause += representsMultipleTypes.map(propertyTypeName => {
        return "[(`" + parentAlias + "`)" + this._relationClause(relationDetails) + "(`" + alias + "`:`" + propertyTypeName + "`) | {" + this._selectedPropertiesClause(propertyTypeName, alias, selection.selectionSet) + "}]";
      }).join(' + ');
    } else {
      // if root-type: generate only one sub-query
      clause += "[(`" + parentAlias + "`)" + this._relationClause(relationDetails) + "(`" + alias + "`:`" + propertyTypeName + "`) | {" + this._selectedPropertiesClause(propertyTypeName, alias, selection.selectionSet) + "}]";
    }

    // end clause
    clause += (isPropertyTypeCollection ? "" : ")") + " ";

    return clause;
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
}

export default GetQuery;