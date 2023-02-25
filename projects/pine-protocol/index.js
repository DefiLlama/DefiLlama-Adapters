const { getLogs, getAddress } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')

async function _getLogs(api) {
  const logs = await getLogs({
    api,
    target: '0x19c56cb20e6e9598fc4d22318436f34981e481f9',
    topics: ['0xfe735a4766d74f0c8b076be3f254cfc301a851f3ac49c4ae35e7d48ab75cd69d'],
    fromBlock: 16423090,
  })
  return logs.map(i => i.topics.slice(1).map(getAddress))
}

async function tvl(_, _b, _cb, { api, }) {
  const logs = await _getLogs(api)
  return sumTokens2({ api, tokensAndOwners: logs.map(i => [i[1], i[0]]) })
}

async function borrowed(_, _b, _cb, { api, }) {
  const balances = {}
  const logs = await _getLogs(api)
  const loans = await api.multiCall({ abi: 'uint256:_currentLoanAmount', calls: logs.map(i => i[0]) })
  loans.forEach((val, i) => sdk.util.sumSingleBalance(balances, logs[i][2], val, api.chain))
  return balances
}

module.exports = {
  methodology: 'value of NFTs locked in pools as taken as tvl, tokens borrowed against it is counted towards borrowed',
  ethereum: {
    tvl, borrowed
  }
}