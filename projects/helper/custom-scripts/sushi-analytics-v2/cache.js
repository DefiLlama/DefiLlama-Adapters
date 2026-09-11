const sdk = require('@defillama/sdk')

function time() {
  if (process.env.TIMESTAMP) return +process.env.TIMESTAMP;
  return Math.round(Date.now() / 1e3);
}

function getTimeString() {
  return new Date(time() * 1e3).toISOString().slice(0, 10)
}

async function writeToElastic({ project, tvlKey, chain, balances }) {
  const timeS = getTimeString()

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


async function readFromElastic({ tvlKey, timestamp, range = 8 * 3600 * 1000, project, throwIfMissing = false }) {
  const startTime = timestamp - range;
  const endTime = timestamp + range;
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
                  gte: startTime,
                  lte: endTime,
                },
              },
            },
          ],
        },
      },
      size: 10,
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

  let record = documents.reduce((closest, doc) => {
    const closestDiff = Math.abs(closest.timestamp - timestamp * 1000);
    const docDiff = Math.abs(doc.timestamp - timestamp * 1000);
    return docDiff < closestDiff ? doc : closest;
  })

  if (record.balancesJSON)
    return { ...record, balances: JSON.parse(record.balancesJSON) }

  return record
}
module.exports = {
  time,
  writeToElastic,
  getTimeString,
  readFromElastic
};