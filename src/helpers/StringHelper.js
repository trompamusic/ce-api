class StringHelper {
  /**
   * @param string
   * @returns {string}
   */
  static lowercaseFirstCharacter (string) {
    return string.charAt(0).toLowerCase() + string.slice(1)
  }
}

export default StringHelper
