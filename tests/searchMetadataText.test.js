import gql from 'graphql-tag';
import { execute } from './helpers';

const SEARCH_METADATA_BY_TEXT_QUERY = gql`
    query($substring: String!, $fields: [SearchableMetadataFields], $types: [MetadataInterfaceType]) {
        searchMetadataText(substring: $substring, onFields: $fields, onTypes: $types) {
            ... on MetadataInterface {
                description
            }
        }
    }
`;

describe('query searchMetadataText', () => {
  it('should return results when using an empty substring', () => {
    return execute(SEARCH_METADATA_BY_TEXT_QUERY, { substring: 'Ma' })
      .then(response => {
        expect(response).toContainData('searchMetadataText');
        expect(response.data.searchMetadataText.length).toEqual(0);
      });
  });
});
