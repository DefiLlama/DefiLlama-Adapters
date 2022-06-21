const { GraphQLClient, } = require('graphql-request')

async function blockQuery(endpoint, query, block, blockCatchupLimit = 200) {
  const graphQLClient = new GraphQLClient(endpoint)
  try {
    const results = await graphQLClient.request(query, { block })
    return results
  } catch (e) {
    if (!block) throw e
    const errorString = e.toString()
    const isBlockCatchupIssue = /Failed to decode.*block.number.*has only indexed up to block number \d+/.test(errorString)
    if (!isBlockCatchupIssue) throw e
    const indexedBlockNumber = +errorString.match(/indexed up to block number (\d+) /)[1]
    console.log('We have indexed only upto ', indexedBlockNumber, 'requested block: ', block)
    if (block - blockCatchupLimit > indexedBlockNumber)
      throw e
    return graphQLClient.request(query, { block: indexedBlockNumber })
  }
}

module.exports = {
  blockQuery
}
