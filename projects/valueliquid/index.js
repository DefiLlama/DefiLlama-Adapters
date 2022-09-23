
const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('../helper/unwrapLPs')

const getCurrentTokens = require('./abis/getCurrentTokens.json')

const tvl = async (_, block) => {
  const logs = (
    await sdk.api.util.getLogs({
      keys: [],
      toBlock: block,
      target: '0xebc44681c125d63210a33d30c55fd3d37762675b',
      fromBlock: 10961776,
      topic: 'LOG_NEW_POOL(address,address)',
    })
  ).output

  const pools = logs
    .map((log) => `0x${log.topics[2].substring(26)}`)
  const calls = pools.map(i => ({ target: i }))
  const { output: tokens } = await sdk.api.abi.multiCall({
    abi: getCurrentTokens,
    calls,
    block,
  })
  const toa = []
  tokens.forEach(({ output, input: { target } }) => {
    output.forEach(i => toa.push([i, target]))
  })
  return sumTokens2({ block, tokensAndOwners: toa, })
}

module.exports = {
  start: 1601440616,  // 09/30/2020 @ 4:36am (UTC)
  ethereum: { tvl }
};
