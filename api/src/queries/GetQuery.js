import { debug, info, warning } from "../index"
import StringHelper from "../helpers/StringHelper";
import SchemaHelper from "../helpers/SchemaHelper";

const paginationParameters = {'offset':'SKIP', 'first':'LIMIT'};

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
    let queryString = "MATCH (`" + alias + "`:`" + this.baseType + "` {" + this._generateConditionalClause() + "}) WITH `" + alias + "`, HEAD(labels(`" + alias + "`)) as _schemaType RETURN `" + alias + "` {" + this._selectedPropertiesClause(this.baseType, alias, this.baseNode.selectionSet) + "}";

    // conclude query
    queryString += " AS `" + alias + "`" + this._generatePaginationClause();

    return queryString;
  }

  _generateConditionalClause () {
    let conditionalClause = '';

    // process all parameters, except pagination parameters
    for (let param in this.params) {
      // ignore pagination parameters
      if(param in paginationParameters) {
        continue;
      }
      conditionalClause += '`' + param + '`:"' + this.params[param] + '"';
    }

    return conditionalClause;
  }

  _generatePaginationClause () {
    let paginationClause = '';

    for (let paginationParam in paginationParameters) {
      if (paginationParam in this.params) {
        paginationClause += ' ' + paginationParameters[paginationParam] + ' ' + this.params[paginationParam];
      }
    }

    return paginationClause;
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
            warning('unknown selection kind encountered: ' + selection.kind);
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
      // ignore library private properties, indicated with double-underscore prefix, like '__typename'
      if (propertyName.substring(0,2) !== '__') {
        propertyClause = "`" + propertyName + "`:`" + parentAlias + "`.`" + propertyName + "`";
      }
    }

    return propertyClause;
  }

  _selectionSetNodeClause (parentType, parentAlias, selection) {
    const propertyName = selection.name.value;
    const propertyType = this.schemaHelper.findPropertyType(parentType, propertyName);
    const alias = parentAlias + "_" + propertyName;

    // determine if property is library private type - these are not related nodes but refer to Neo4j property collection, like '_Neo4jDate'
    let propertyTypeName = propertyType.type.toString();
    if (propertyTypeName.substring(0,1) === '_') {
      const visibleProperties = selection.selectionSet.selections.map(selection => {
        const visiblePropertyName = selection.name.value;
        return visiblePropertyName + ': `' + parentAlias + '`.' + propertyName + '.' + visiblePropertyName;
      });

      return propertyName + ': { ' + visibleProperties.join(', ') + ' }';
    }

    // determine property is single or array of values
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
    let clause = propertyName + ": " + (isPropertyTypeCollection ? "" : "HEAD(");

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