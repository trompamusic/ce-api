import gql from 'graphql-tag';
import { execute } from './helpers';

const PERSON_BY_SUBSTRING_QUERY = gql`
    query($substring: String!) {
        personBySubstring(substring: $substring) {
            name
        }
    }
`;

describe('query personBySubstring', () => {
  it('should return results when using an empty substring', () => {
    return execute(PERSON_BY_SUBSTRING_QUERY, { substring: '' })
      .then(response => {
        expect(response).toContainData('personBySubstring');
        expect(response.data.personBySubstring.length).toEqual(7);
      });
  });

  it('should return filtered results when searching on a substring', () => {
    return execute(PERSON_BY_SUBSTRING_QUERY, { substring: 'Ma' })
      .then(response => {
        expect(response).toContainData('personBySubstring');
        expect(response.data.personBySubstring.length).toEqual(3);
      });
  });
});
