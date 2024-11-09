const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(api) {
  const { factory, fromBlock, } = config[api.chain]
  const logs = await getLogs({
    api,
    target: factory,
    topics: ['0x48dc7a1b156fe3e70ed5ed0afcb307661905edf536f15bb5786e327ea1933532'],
    fromBlock,
    eventAbi: 'event NewStableSwapPair (address indexed swapContract, address tokenA, address tokenB, address tokenC, address LP)',
    onlyArgs: true,
  })
  return sumTokens2({ api, ownerTokens: logs.map(({ tokenA, tokenB, tokenC, swapContract }) => ([[tokenA, tokenB, tokenC], swapContract])) })
} 

const config = {
  arbitrum: { factory: '0x3a52e9200Ed7403D9d21664fDee540C2d02c099d', fromBlock: 78843656 },
  arbitrum_nova: { factory: '0x11f6206AEF570aE946C0117C8f4B298B0A706f18', fromBlock: 3732144 },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})