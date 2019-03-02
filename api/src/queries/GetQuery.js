// GetQuery.js
"use strict"

import StringHelper from "../helpers/StringHelper";
import SchemaHelper from "../helpers/SchemaHelper";

class GetQuery {

  constructor (params, resolveInfo) {
    this.params = params;
    this.resolveInfo = resolveInfo;

    this.schemaHelper = new SchemaHelper(resolveInfo.schema);
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
    let properties = ["`_schemaType`:HEAD(labels(`"+parentAlias+"`))"];

    if (selectionSet.kind !== 'SelectionSet') {
      throw Error('Property clause generation needs a selectionSet');
    }

    // TODO distinguish between Root, Interface and Union types

    selectionSet.selections.map(selection => {
      switch (selection.kind) {
        case "Field":
          console.log('Field encountered:');
          console.log(selection);
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
          console.log('InlineFragment encountered:');
          // console.log(selection);
          // let inlineNodeClause = this._inlineFragmentNodeClause(parentType, parentAlias, selection);
          // console.log('inlineNodeClause:');
          // console.log(inlineNodeClause);
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
    const propertyType = this.schemaHelper.findPropertyType(parentType, selection.name.value);

    // determine property has single or multiple values
    let propertyTypeName = propertyType.type.toString();
    let isPropertyTypeCollection = false;
    if (true === this.bracketRegEx.test(propertyTypeName)) {
      propertyTypeName = propertyTypeName.slice(1,-1);
      isPropertyTypeCollection = true;
    }

    // determine property is of implementation type (Union or Interface)
    const implementationType = this.schemaHelper.findImplementationType(propertyTypeName);
    if (typeof implementationType === 'object') {
      console.log('implementationType:');
      console.log(implementationType);
      console.log('retrieve Inlinefragments.selection:');
      console.log(selection);
      console.log('retrieve Inlinefragments.selection.selectionSet:');
      console.log(selection.selectionSet);
      // clause = _implementationTypeClause(alias, selection);
    }

    const relationDetails = SchemaHelper.retrievePropertyTypeRelationDetails(propertyType);

    let clause = selection.name.value + ": " + (isPropertyTypeCollection ? "" : "HEAD(") + "[(`" + parentAlias + "`)" + this._relationClause(relationDetails) + "(`" + alias + "`:`" + propertyTypeName + "`) | {" + this._selectedPropertiesClause(propertyTypeName, alias, selection.selectionSet) + "}]" + (isPropertyTypeCollection ? "" : ")") + " ";
    return null;
    return clause;
  }

  _implementationTypeClause (alias, selection) {
    console.log('_implementationTypeClause called');


  }

  _inlineFragmentNodeClause (parentType, parentAlias, selection) {
    console.log('_inlineFragmentNodeClause() called');
    console.log('selection:');
    console.log(selection);

    // const alias = parentAlias + "_" + selection.name.value;
    const propertyTypeName = selection.typeCondition.name.value;
    console.log('propertyTypeName:');
    console.log(propertyTypeName);



    const propertyType = this.schemaHelper.findPropertyType(parentType, propertyTypeName);
    console.log('propertyType:');
    console.log(propertyType);

    // const relationDetails = retrievePropertyTypeRelationDetails(propertyType);




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
}

export default GetQuery;