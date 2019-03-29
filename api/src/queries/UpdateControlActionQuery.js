class UpdateControlActionQuery {
  /**
   * @param params
   */
  constructor (params) {
    this.params = params
  }

  /**
   * @returns {string}
   */
  get query () {
    let setPropertyClauses = []
    Object.entries(this.params).forEach(([key, value]) => {
      setPropertyClauses.push(`${key}: "${value}"`)
    })
    return [
      `MATCH (\`controlAction\`:\`ControlAction\`{identifier: "${this.params.identifier}"})`,
      `SET \`controlAction\` += {${setPropertyClauses.join(', ')}}`,
      `RETURN \`controlAction\` AS \`_payload\``
    ].join(' ')
  }
}

export default UpdateControlActionQuery
