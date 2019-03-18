import { debug } from '../index'
import { schema as defaultSchema } from '../schema'

class SchemaHelper {
  constructor (schema) {
    this.schema = (typeof schema === 'object') ? schema : defaultSchema
  }

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

  findInterfaceImplementingTypes (interfaceName) {
    const implementations = this.schema._implementations[interfaceName]
    if (implementations instanceof Array === false || !implementations.length) {
      return null
    }

    return implementations.map(implementation => { return implementation.toString() })
  }

  findPossibleTypes (unionName) {
    const possibleTypes = this.schema._possibleTypeMap[unionName]
    if (typeof possibleTypes !== 'object') {
      return null
    }

    return Object.keys(possibleTypes)
  }

  static retrievePropertyTypeRelationDetails (propertyType) {
    let relationDetails = {}

    const directives = propertyType.astNode.directives
    debug(directives)
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
