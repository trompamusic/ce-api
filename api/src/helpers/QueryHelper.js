import { debug, warning } from '../index'
import { schema as defaultSchema } from '../schema'
import SchemaHelper from './SchemaHelper'

const bracketRegExString = '^\\[.*?\\]$'
const paginationParameters = { 'offset': 'SKIP', 'first': 'LIMIT' }

class QueryHelper {
  constructor (schema) {
    this.schema = (typeof schema === 'object') ? schema : defaultSchema
    this.schemaHelper = new SchemaHelper(this.schema)
  }

  selectedPropertiesClause (parentType, parentAlias, selectionSet) {
    let propertyClauses = [`\`_schemaType\`:HEAD(labels(\`${parentAlias}\`))`]

    if (selectionSet.kind !== 'SelectionSet') {
      throw Error('Property clause generation needs a selectionSet')
    }

    selectionSet.selections.map(selection => {
      switch (selection.kind) {
        case 'Field':
          const nodeClause = this.selectedPropertyClause(parentType, parentAlias, selection)
          if (typeof nodeClause === 'string') {
            propertyClauses.push(nodeClause)
          }
          break
        case 'InlineFragment':
          if (selection.typeCondition.kind === 'NamedType' && selection.typeCondition.name.value === parentType) {
            selection.selectionSet.selections.map(namedTypeSelection => {
              const nodeClause = this.selectedPropertyClause(parentType, parentAlias, namedTypeSelection)
              if (typeof nodeClause === 'string') {
                propertyClauses.push(nodeClause)
              }
            })
          }
          break
        default:
          warning('unknown selection kind encountered: ' + selection.kind)
      }
    })

    return propertyClauses.join(`, `)
  }

  selectedPropertyClause (parentType, parentAlias, selection) {
    let propertyClause = null

    if (typeof selection.selectionSet === 'object' && selection.selectionSet !== null) {
      // this is a deeper node with its own properties - recurse
      propertyClause = this.selectionSetNodeClause(parentType, parentAlias, selection)
    } else {
      const propertyName = selection.name.value.toString()
      // ignore library private properties, indicated with double-underscore prefix, like '__typename'
      if (propertyName.substring(0, 2) !== '__') {
        propertyClause = `\`${propertyName}\`:\`${parentAlias}\`.\`${propertyName}\``
      }
    }

    return propertyClause
  }

  selectionSetNodeClause (parentType, parentAlias, selection) {
    const propertyName = selection.name.value
    const propertyType = this.schemaHelper.findPropertyType(parentType, propertyName)
    const alias = `${parentAlias}_${propertyName}`

    // determine if property is library private type - these are not related nodes but refer to Neo4j property collection, like '_Neo4jDate'
    let propertyTypeName = propertyType.type.toString()
    if (propertyTypeName.substring(0, 1) === '_') {
      const visibleProperties = selection.selectionSet.selections.map(selection => {
        const visiblePropertyName = selection.name.value
        return `${visiblePropertyName}: \`${parentAlias}\`.${propertyName}.${visiblePropertyName}`
      })

      return `${propertyName}: { ${visibleProperties.join(', ')} }`
    }

    // determine property is single or array of values
    let isPropertyTypeCollection = false
    const bracketTest = new RegExp(bracketRegExString)
    if (bracketTest.test(propertyTypeName) === true) {
      propertyTypeName = propertyTypeName.slice(1, -1)
      isPropertyTypeCollection = true
    }

    const relationDetails = SchemaHelper.retrievePropertyTypeRelationDetails(propertyType)

    // determine propertyType represents either possible Union types or Interface implementations
    let representsMultipleTypes = this.schemaHelper.findInterfaceImplementingTypes(propertyTypeName)
    if (representsMultipleTypes instanceof Array === false) {
      representsMultipleTypes = this.schemaHelper.findPossibleTypes(propertyTypeName)
    }

    // start clause
    let clause = `${propertyName}: ${(isPropertyTypeCollection ? '' : 'HEAD(')}`

    if (representsMultipleTypes instanceof Array) {
      // if Union or Interface type: generate subquery for each represented Type
      clause += representsMultipleTypes.map(propertyTypeName => {
        return [
          `[(\`${parentAlias}\`)`,
          QueryHelper.relationClause(relationDetails),
          `(\`${alias}\`:\`${propertyTypeName}\`) | {`,
          this.selectedPropertiesClause(propertyTypeName, alias, selection.selectionSet),
          `}]`
        ].join(' ')
      }).join(' + ')
    } else {
      // if root-type: generate only one sub-query
      clause += [
        `[(\`${parentAlias}\`)`,
        QueryHelper.relationClause(relationDetails),
        `(\`${alias}\`:\`${propertyTypeName}\`) | {`,
        this.selectedPropertiesClause(propertyTypeName, alias, selection.selectionSet),
        `}]`
      ].join(' ')
    }

    // end clause
    clause += (isPropertyTypeCollection ? '' : ')') + ' '

    return clause
  }

  generateRelationClause (type, propertyName, alias, invert) {
    return QueryHelper.relationClause(
      SchemaHelper.retrievePropertyTypeRelationDetails(
        this.schemaHelper.findPropertyType(type, propertyName)
      ),
      alias,
      invert
    )
  }

  static relationClause (relationDetails, alias, invert) {
    let clause = `-[${(typeof alias === 'string') ? `\`${alias}\`` : ``}:\`${relationDetails['name']}\`]-`

    switch (relationDetails['direction'].toString().toUpperCase()) {
      case 'OUT':
        clause = `${(invert) ? '<' : ''}${clause}${(invert) ? '' : '>'}`
        break
      case 'IN':
        clause = `${(invert) ? '' : '<'}${clause}${(invert) ? '>' : ''}`
        break
      case 'BOTH':
        clause = `<${clause}>`
        break
      default:
        throw Error('Invalid relation direction encountered')
    }

    return clause
  }

  static schemaTypeClause (alias) {
    return `\`_schemaType\`:HEAD(labels(\`${alias}\`))`
  }

  generateConditionalClause (params) {
    let conditionalClause = ''

    // process all parameters, except pagination parameters
    for (let param in params) {
      // ignore pagination parameters
      if (param in paginationParameters) {
        continue
      }
      conditionalClause += `\`${param}\`:"${params[param]}"`
    }

    return conditionalClause
  }

  generatePaginationClause (params) {
    let paginationClause = ''

    for (let paginationParam in paginationParameters) {
      if (paginationParam in params) {
        paginationClause += ` ${paginationParameters[paginationParam]} ${params[paginationParam]}`
      }
    }

    return paginationClause
  }

  static propertySetClause (alias, properties) {
    return properties.map(property => {
      return `\`${alias}\`:\`${alias}\`.\`${property}\``
    }).join(', ')
  }
}

export default QueryHelper
