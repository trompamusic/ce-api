import { info, debug, warning } from '../index'
import { schema as defaultSchema } from '../schema'
import SchemaHelper from './SchemaHelper'
import StringHelper from './StringHelper'

const bracketRegExString = '^\\[.*?\\]$'
const paginationParameters = { 'offset': 'SKIP', 'first': 'LIMIT' }

class QueryHelper {
  /**
   * @param schema
   */
  constructor (schema) {
    this.schema = (typeof schema === 'object') ? schema : defaultSchema
    this.schemaHelper = new SchemaHelper(this.schema)
  }

  /**
   * @param typeName
   * @param alias
   * @param host
   * @param depth
   * @returns {string}
   */
  typeFieldsClause (typeName, alias, host, depth = 2) {
    if (depth <= 0) {
      debug('typeFieldsClause depth reached')
      return `DEPTH REACHED`
    }

    const typeFields = this.schemaHelper.getTypeFields(typeName)
    const segments = Object.getOwnPropertyNames(typeFields).map(fieldName => {
      // info(`resolve fieldName '${fieldName}':`)
      const fieldType = typeFields[fieldName]
      // let retrievedType = null
      let isListType = false
      switch (fieldType.astNode.type.kind) {
        case 'ListType':
          isListType = true
        // intentional fallthrough
        case 'NonNullType':
          return this._generateFieldClause(typeName, fieldName, fieldType.astNode.type.type, alias, isListType, host, depth - 1)
        default:
          return this._generateFieldClause(typeName, fieldName, fieldType.astNode.type, alias, isListType, host, depth - 1)
      }
    })

    return segments.join(', ')
  }

  /**
   * @param typeName
   * @param fieldName
   * @param fieldType
   * @param alias
   * @param isListType
   * @param host
   * @param depth
   * @returns {string}
   * @private
   */
  _generateFieldClause (typeName, fieldName, fieldType, alias, isListType, host, depth) {
    // debug(`typeFieldsClause called for fieldName '${fieldName}' with depth: ${depth}`)
    const fieldTypeName = fieldType.name.value
    // debug(`fieldName: ${fieldName}, fieldTypeName: ${fieldTypeName}`)
    const type = this.schemaHelper.getSchemaType(fieldTypeName)
    if (typeof type === 'undefined') {
      warning(`unknown type encountered: ${fieldTypeName}`)
      return `UNKNOWN TYPE`
    }

    let segments = []
    // info(`type.constructor.name: ${type.constructor.name}`)
    const className = type.constructor.name
    switch (className) {
      case 'GraphQLScalarType':
        // intentional fallthrough
      case 'GraphQLEnumType':
        // suppress private properties (underscore)
        if (fieldName.startsWith('_')) {
          segments.push(`SUPPRESS: ${fieldName}`)
        } else {
          segments.push(QueryHelper.scalarPropertyClause(fieldName, alias))
        }
        break
      case 'GraphQLObjectType':
        // return _Neo4j classes (datetime etc) as Scalars not Objects
        if (fieldTypeName.startsWith('_Neo4j')) {
          info(`_Neo4j class detected`)
          segments.push(QueryHelper.scalarPropertyClause(fieldName, alias))
        } else if (depth <= 1) {
          segments.push(`Object fieldType ${fieldTypeName} identifier`)
        } else {
          segments.push(`Object fieldType ${fieldTypeName} fields`)
        }
        break
      case 'GraphQLInterfaceType':
        if (depth <= 1) {
          segments.push(`Interface fieldType ${fieldTypeName} identifier`)
        } else {
          segments.push(`Interface fieldType ${fieldTypeName} fields`)
        }
        break
      case 'GraphQLUnionType':
        const unionType = this.schemaHelper.findUnionType(fieldTypeName)
        if (!unionType || unionType._types.length <= 0) {
          break
        }
        segments.push(`\`${fieldName}\`:${isListType ? `` : `HEAD(`}`)
        segments.push(
          unionType._types.map(unionType => {
            if (depth <= 1) {
              return this._nodePropertyURIClause(typeName, alias, fieldName, unionType.name, host)
            } else {
              return `Union fieldType ${unionType.name} fields`
            }
          }).join(' + '))
        segments.push(`${isListType ? `` : `)`}`)
        break
      default:
        warning(`unknown type class encountered: ${fieldTypeName}`)
        break
    }

    return segments.join(' ')
  }

  /**
   * @param parentType
   * @param parentAlias
   * @param selectionSet
   * @returns {string}
   */
  selectedPropertiesClause (parentType, parentAlias, selectionSet) {
    let scalarPropertyClauses = [`\`_schemaType\`:HEAD(labels(\`${parentAlias}\`))`]

    if (selectionSet.kind !== 'SelectionSet') {
      throw Error('Property clause generation needs a selectionSet')
    }

    selectionSet.selections.map(selection => {
      switch (selection.kind) {
        case 'Field':
          const nodeClause = this.selectedPropertyClause(parentType, parentAlias, selection)
          if (typeof nodeClause === 'string') {
            scalarPropertyClauses.push(nodeClause)
          }
          break
        case 'InlineFragment':
          if (selection.typeCondition.kind === 'NamedType' && selection.typeCondition.name.value === parentType) {
            selection.selectionSet.selections.map(namedTypeSelection => {
              const nodeClause = this.selectedPropertyClause(parentType, parentAlias, namedTypeSelection)
              if (typeof nodeClause === 'string') {
                scalarPropertyClauses.push(nodeClause)
              }
            })
          }
          break
        default:
          warning('unknown selection kind encountered: ' + selection.kind)
      }
    })

    return scalarPropertyClauses.join(`, `)
  }

  /**
   * @param parentType
   * @param parentAlias
   * @param selection
   * @returns {*}
   */
  selectedPropertyClause (parentType, parentAlias, selection) {
    let scalarPropertyClause = null

    if (typeof selection.selectionSet === 'object' && selection.selectionSet !== null) {
      // this is a deeper node with its own properties - recurse
      scalarPropertyClause = this.selectionSetNodeClause(parentType, parentAlias, selection)
    } else {
      const propertyName = selection.name.value.toString()
      // ignore library private properties, indicated with double-underscore prefix, like '__typename'
      if (propertyName.substring(0, 2) !== '__') {
        scalarPropertyClause = `\`${propertyName}\`:\`${parentAlias}\`.\`${propertyName}\``
      }
    }

    return scalarPropertyClause
  }

  /**
   * @param parentType
   * @param parentAlias
   * @param selection
   * @returns {string}
   */
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

  /**
   * @param type
   * @param propertyName
   * @param alias
   * @param invert
   * @returns {string}
   */
  generateRelationClause (type, propertyName, alias, invert) {
    return QueryHelper.relationClause(
      SchemaHelper.retrievePropertyTypeRelationDetails(
        this.schemaHelper.findPropertyType(type, propertyName)
      ),
      alias,
      invert
    )
  }

  /**
   * @param params
   * @returns {string}
   */
  generatePaginationClause (params) {
    let paginationClause = ''

    for (let paginationParam in paginationParameters) {
      if (paginationParam in params) {
        paginationClause += ` ${paginationParameters[paginationParam]} ${params[paginationParam]}`
      }
    }

    return paginationClause
  }

  /**
   * @param params
   * @returns {string}
   */
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

  /**
   * @param relationDetails
   * @param alias
   * @param invert
   * @returns {string}
   */
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

  /**
   * @param alias
   * @returns {string}
   */
  static schemaTypeClause (alias) {
    return `\`_schemaType\`:HEAD(labels(\`${alias}\`))`
  }

  /**
   * @param propertyName
   * @param alias
   * @returns {string}
   */
  static scalarPropertyClause (propertyName, alias) {
    return `\`${propertyName}\`:\`${alias}\`.\`${propertyName}\``
  }

  /**
   * @param parentTypeName
   * @param parentAlias
   * @param propertyName
   * @param propertyTypeName
   * @param host
   * @returns {string}
   * @private
   */
  _nodePropertyURIClause (parentTypeName, parentAlias, propertyName, propertyTypeName, host) {
    const propertyTypeAlias = StringHelper.lowercaseFirstCharacter(propertyTypeName)
    const relatedNodeAlias = `${parentAlias}_${propertyTypeAlias}`
    return [
      `[(\`${parentAlias}\`)${this.generateRelationClause(parentTypeName, propertyName)}(\`${relatedNodeAlias}\`:\`${propertyTypeName}\`)`,
      `|`,
      `"${host.replace(/\/$|$/, '/')}"+\`${relatedNodeAlias}\`.\`identifier\` ]`
    ].join(' ')
  }

  /**
   * @param alias
   * @param properties
   * @returns {*}
   */
  static propertySetClause (alias, properties) {
    return properties.map(property => {
      return `\`${alias}\`:\`${alias}\`.\`${property}\``
    }).join(', ')
  }
}

export default QueryHelper
