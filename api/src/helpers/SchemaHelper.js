// SchemaHelper.js
"use strict"

import { schema as defaultSchema } from "../schema"

class SchemaHelper {

  constructor(schema) {
    console.log('typeof schema');
    console.log(typeof schema);
    this.schema = (typeof schema === 'undefined') ? defaultSchema : schema;
  }

  findPropertyType (parentType, propertyName) {
    console.log('findPropertyType() called');
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

  findImplementationType (typeName) {
    return this.schema._implementations[typeName];
  }

  static retrievePropertyTypeRelationDetails (propertyType) {
    console.log('retrievePropertyTypeRelationDetails() called');
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

export default SchemaHelper;