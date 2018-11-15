import algoliasearch from 'algoliasearch';

const searchClient = algoliasearch(
  'OFCNCOG2CU',
  '2ecf81d560c9d884964cb7237fff6bd8'
);
const resultsIndex = searchClient.initIndex('npm-search');

export async function handler(event, context, callback) {
  const { query } = event.queryStringParameters;

  const { hits, nbHits, page, hitsPerPage } = await resultsIndex.search({
    query,
    attributesToRetrieve: ['name'],
    attributesToSnippet: ['description'],
    attributesToHighlight: [],
  });
  callback(null, {
    statusCode: 200,
    body: `
    <?xml version="1.0" encoding="UTF-8"?>
    <rss
      version="2.0"
      xmlns:opensearch="http://a9.com/-/spec/opensearch/1.1/"
      xmlns:atom="http://www.w3.org/2005/Atom"
    >
      <channel>
        <title>Yarn Search: ${query}</title>
        <link>https://yarnpkg.com/en/packages?q=${query}</link>
        <description>Search results for "${query}" at Yarnpkg.com</description>
        <opensearch:totalResults>${nbHits}</opensearch:totalResults>
        <opensearch:startIndex>${page * hitsPerPage}</opensearch:startIndex>
        <opensearch:itemsPerPage>${hitsPerPage}</opensearch:itemsPerPage>
        <atom:link
          rel="search"
          type="application/opensearchdescription+xml"
          href="http://example.com/opensearchdescription.xml"
        />
        <opensearch:Query
          role="request"
          searchTerms="${query}"
          startPage="${page + 1}"
        />
        ${hits
          .map(
            ({ name, _snippetResult: { description } }) => `
              <item>
                <title>${name}</title>
                <link>https://yarnpkg.com/en/package/${name}</link>
                <description>${description.value}</description>
              </item>
            `
          )
          .join('\n')}
      </channel>
    </rss>
    `.trim(),
  });
}
