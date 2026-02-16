const sdk = require('@defillama/sdk')

async function writeToElastic({ project, tvlKey, chain, balances }) {

  return sdk.elastic.writeLog('custom-scripts', {
    metadata: {
      type: 'tvl',
    },
    chain,
    project,
    tvlKey,
    balances,
    timestamp: Math.floor(Date.now()),  // think this get overwritten by sdk.elastic
  });
}


async function readFromElastic({ tvlKey, timestamp, range, project, throwIfMissing = false }) {
  const startTime = timestamp - range;
  const response = await sdk.elastic.search({
    index: 'custom-scripts*',
    body: {
      query: {
        bool: {
          must: [
            {
              match: {
                'tvlKey.keyword': tvlKey,
              },
            },
            {
              match: {
                'metadata.type': 'tvl',
              },
            },
            {
              match: {
                'project.keyword': project,
              },
            },
            {
              range: {
                timestamp: {
                  gte: startTime * 1000,
                  lte: timestamp * 1000,
                },
              },
            },
          ],
        },
      },
      size: 1,
      sort: [{ timestamp: { order: 'desc' } }],
    },
  });

  const documents = response.hits.hits.map((hit) => hit._source);

  if (documents.length === 0) {
    if (throwIfMissing) {
      throw new Error('No documents found for the given criteria');
    } else {
      return null;
    }
  }

  return documents[0]
}
module.exports = {
  writeToElastic,
  readFromElastic
};