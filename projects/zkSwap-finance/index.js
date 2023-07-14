const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const FACTORY = '0x3a76e377ed58c8731f9df3a36155942438744ce3'
const CHAIN = 'era'

async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
  const factoryLogs = await getLogs({
    api,
    target: FACTORY,
    fromBlock: 4182273,
    topic: 'PairCreated(address,address,address,uint256)',
    eventAbi: 'event PairCreated(address indexed token0, address indexed token1, address pair, uint256)',
    onlyArgs: true,
  })
  
  let balanceRequests = []
  factoryLogs.forEach(({ token0, token1, pair}) => {
    balanceRequests.push([token0, pair])
    balanceRequests.push([token1, pair])
  })
  return sumTokens2({ chain: CHAIN, ethBlock, tokensAndOwners: balanceRequests })
}

module.exports = {
  era: { tvl, },
  methodology: "TVL is total liquidity of all liquidity pools."
}
