import { readFileSync } from 'fs'

/**
 * Concatenate the contents of the given file names
 * @param fileNames
 * @return {string}
 */
export default (fileNames) => {
  if (!Array.isArray(fileNames) || !fileNames.length) {
    return ''
  }

  return fileNames
    .map(file => readFileSync(file, { encoding: 'utf-8' }))
    .join('\n')
}
