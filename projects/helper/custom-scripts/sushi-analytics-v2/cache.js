const sdk = require('@defillama/sdk')

function time() {
  if (process.env.TIMESTAMP) return +process.env.TIMESTAMP;
  return Math.round(Date.now() / 1e3);
}

async function writeToElastic({ project, tvlKey, chain, balances }) {
  const timeS = new Date(time() * 1e3).toISOString().slice(0, 10)

  return sdk.elastic.writeLog('custom-scripts', {
    metadata: {
      type: 'tvl',
    },
    chain,
    project,
    tvlKey,
    timeS,
    balancesJSON: typeof balances === 'object' ? JSON.stringify(balances) : balances,
    timestamp: time() * 1e3,  // think this get overwritten by sdk.elastic
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

  let record = documents[0]
  if (record.balancesJSON)
    return { ...record, balances: JSON.parse(record.balancesJSON) }

  return record
}
module.exports = {
  time,
  writeToElastic,
  readFromElastic
};