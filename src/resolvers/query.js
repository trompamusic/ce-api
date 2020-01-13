import { info } from '../utils/logger'
import { driver } from '../driver'
import SearchQuery from '../queries/SearchQuery'

export const queryResolvers = {
  Query: {
    searchMetadataText (object, params, context, resolveInfo) {
      const queryGenerator = new SearchQuery(params, resolveInfo)
      const query = queryGenerator.query
      info(`query: ${query}`)

      // fetch and process search results
      let session = driver.session()
      return session.run(query, params)
        .then(result => {
          return result.records.map(record => record.get('node'))
        })
        .catch(function (error) {
          throw Error(error.toString())
        })
    }
  }
}
