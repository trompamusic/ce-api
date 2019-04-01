import QueryHelper from '../helpers/QueryHelper'

class UpdateControlActionQuery {
  /**
   * @param params
   */
  constructor (params, resolveInfo) {
    this.params = params
    this.queryHelper = new QueryHelper()

    this.baseNode = resolveInfo.fieldNodes[0]
    this.baseType = this.baseNode.name.value
  }

  /**
   * @returns {string}
   */
  get query () {
    let setPropertyClauses = []
    Object.entries(this.params).forEach(([key, value]) => {
      setPropertyClauses.push(`${key}: "${value}"`)
    })

    const alias = `controlAction`

    return [
      `MATCH (\`${alias}\`:\`ControlAction\`{identifier: "${this.params.identifier}"})`,
      `SET \`${alias}\` += {${setPropertyClauses.join(', ')}}`,
      `RETURN \`${alias}\` {`,
      this.queryHelper.selectedPropertiesClause(this.baseType, alias, this.baseNode.selectionSet),
      `} AS \`_payload\``
    ].join(' ')
  }
}

export default UpdateControlActionQuery
