import { schema as defaultSchema } from '../schema'
import { info, debug, warning } from '../index'

class SchemaHelper {
  constructor (schema) {
    this.schema = (typeof schema === 'object') ? schema : defaultSchema
    this.schemaTypeMap = this.schema._typeMap
  }

  /**
   * @param parentType
   * @param propertyName
   * @returns {GraphQLField<*, *>|GraphQLInputField}
   */
  findPropertyType (parentType, propertyName) {
    const typeMap = this.schema._typeMap[parentType]
    if (typeof typeMap === 'undefined') {
      throw Error('Type could not be retrieved from schema')
    }

    const propertyType = typeMap._fields[propertyName]
    if (typeof propertyType === 'undefined') {
      throw Error('Property type could not be retrieved from schema')
    }

    return propertyType
  }

  /**
   * @param interfaceName
   * @returns {*}
   */
  findInterfaceImplementingTypes (interfaceName) {
    const implementations = this.findInterface(interfaceName)
    if (implementations instanceof Array === false || !implementations.length) {
      return null
    }

    return implementations.map(implementation => { return implementation.toString() })
  }

  /**
   * @param interfaceName
   * @returns {*|Array<GraphQLObjectType>}
   */
  findInterface (interfaceName) {
    return this.schema._implementations[interfaceName]
  }

  /**
   * @param unionName
   * @returns {*}
   */
  findPossibleTypes (unionName) {
    const possibleTypes = this.schema._possibleTypeMap[unionName]
    if (typeof possibleTypes !== 'object') {
      return null
    }

    return Object.keys(possibleTypes)
  }

  /**
   * @param unionName
   * @returns {*}
   */
  findUnionType (unionName) {
    const schemaType = this.getSchemaType(unionName)
    if (typeof schemaType === 'undefined' || schemaType.astNode.kind !== 'UnionTypeDefinition') {
      warning(`findUnionTypes() called on non-existent Union Type '${unionName}'`)
    }

    return schemaType
  }

  /**
   * @param typeName
   * @returns {*}
   */
  getTypeFields (typeName) {
    const schemaType = this.getSchemaType(typeName)
    // debug('schemaType:')
    // debug(schemaType)
    const typeFields = schemaType._fields
    if (typeof typeFields === 'undefined') {
      info('No typeFields (type could be scalar)')
      return null
    }

    return typeFields
  }

  /**
   * @param typeName
   * @returns {*}
   */
  getSchemaType (typeName) {
    // debug('getSchemaType for:' + typeName)
    const schemaType = this.schemaTypeMap[typeName]
    if (typeof schemaType === 'undefined') {
      throw Error('Type could not be retrieved from schema')
    }

    return schemaType
  }

  /**
   * @param propertyType
   */
  static retrievePropertyTypeRelationDetails (propertyType) {
    let relationDetails = {}

    const directives = propertyType.astNode.directives
    if (directives instanceof Array === false) {
      throw Error('Type property directives could not be retrieved from schema')
    }

    for (let di = 0; di < directives.length; di++) {
      const directive = directives[di]
      if (directive.name.value === 'relation') {
        const directiveArguments = directive.arguments
        directiveArguments.map(directiveArgument => {
          if (directiveArgument.kind === 'Argument') {
            switch (directiveArgument.name.value.toString()) {
              case 'name':
                relationDetails.name = directiveArgument.value.value
                break
              case 'direction':
                relationDetails.direction = directiveArgument.value.value
                break
              default:
              // do nothing
            }
          }
        })
        if (Object.keys(relationDetails).length >= 1) {
          break
        }
      }
    }

    return relationDetails
  }
}

export default SchemaHelper
