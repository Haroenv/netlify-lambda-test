import algoliasearch from 'algoliasearch';

const searchClient = algoliasearch(
  'OFCNCOG2CU',
  '2ecf81d560c9d884964cb7237fff6bd8'
);
const suggestionsIndex = searchClient.initIndex('npm_search_query_suggestions');

export async function handler(event, context, callback) {
  const { query } = event.queryStringParameters;

  const { hits } = await suggestionsIndex.search({
    query,
    attributesToRetrieve: ['query', 'npm-search'],
    attributesToHighlight: [],
  });
  callback(null, {
    statusCode: 200,
    body: JSON.stringify([
      query,
      hits.map(({ query }) => query),
      hits.map(
        ({ 'npm-search': { exact_nb_hits } }) =>
          `${exact_nb_hits.toLocaleString('en-US')} result${
            exact_nb_hits === 1 ? '' : 's'
          }`
      ),
      hits.map(({ query }) => `https://yarnpkg.com/en/packages?q=${query}`),
    ]),
  });
}
