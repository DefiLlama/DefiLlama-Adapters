const { getLogs, getAddress } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(_, _b, _cb, { api, }) {
  const logs = await getLogs({
    api,
    target: '0xcAB2E5Ba8b3A8d8Bf8B50F0eec12884D0255fB4A',
    topics: ['0x68ff1cfcdcf76864161555fc0de1878d8f83ec6949bf351df74d8a4a1a2679ab'],
    fromBlock: 39476334,
  })

  const ownerTokens = logs.map(i => {
    const token0 = getAddress(i.data.slice(64, 64*2+2))
    const token1 = getAddress(i.data.slice(64 * 2, 64*3+2))
    const pool = getAddress(i.data.slice(64 * 3, 64*4+2))
    return [[token0, token1], pool]
  })

  return sumTokens2({ api, ownerTokens})
}

module.exports = { polygon: { tvl }}