const { sumTokensExport } = require('../helper/unknownTokens')

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
  era: {
    tvl: tvl,
    staking: sumTokensExport({ owner: '0x9F9D043fB77A194b4216784Eb5985c471b979D67', tokens: ['0x31C2c031fDc9d33e974f327Ab0d9883Eae06cA4A'], lps: ['0xD33A17C883D5aA79470cd2522ABb213DC4017E01'], useDefaultCoreAssets: true }),
  },
  methodology: "TVL is total liquidity of all liquidity pools."
}
