const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

async function tvl(_, _b, _cb, { api, }) {
  const logs = await getLogs({
    api,
    target: '0x8e2b50413a53f50e2a059142a9be060294961e40',
    topics: ['0xd02da1bec30f7f750aa0a131745dfb9ce96767c45a192dc26409f5d690e0b967'],
    eventAbi: 'event NewPool(address poolAddress, address indexed nftAddress, address indexed owner)',
    onlyArgs: true,
    fromBlock: 17082136,
  })
  const ownerTokens = logs.map(i => [[i.nftAddress, nullAddress], i.poolAddress])
  return sumTokens2({ api, ownerTokens, })
}

module.exports = {
  ethereum: {
    tvl
  }
}