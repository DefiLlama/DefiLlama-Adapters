const sdk = require("@defillama/sdk");
const { cachedGraphQuery } = require('../helper/cache')
const abi = require('./abi.json')

const GRAPH_URLS = {
  ethereum: [
    sdk.graph.modifyEndpoint('DpnLpjCKyyQ8TZnD2V6VNyx4JR7bGrCfGaLbrrsn5r7s'),
    sdk.graph.modifyEndpoint('6SXRM2pyUiLKgNvXU6fiSF1E3dDDFGGAFiMurbZhZew8'),
    sdk.graph.modifyEndpoint('6fBV3gC2fjdPsKvnmhi2SNzp74RYZj3tS1AiWFGHapyX'),
    sdk.graph.modifyEndpoint('C12o8EA9X9EKjjDoxKGUiM9YniNT4RVCiV6jGuYWwwZX')
  ],
  celo: [sdk.graph.modifyEndpoint('7RqWfG27PACLZEvSMGtcK87qnV1DJCQfYjNdqwHDQdTe')],
  bsc: [sdk.graph.modifyEndpoint('9Qmsc7YBLy2sdbEAcGv8vkpaqdGm3YMYoqiWLCid64MN')]
}
const GRAPH_QUERY = `
  query GET_POOLS {
    prizePools { id }
  }
`
async function tvl(api) {
  const graphUrls = GRAPH_URLS[api.chain] ?? []
  const pools = []
  if (api.chain === 'polygon') pools.push('0x887E17D791Dcb44BfdDa3023D26F7a04Ca9C7EF4', '0xee06abe9e2af61cabcb13170e01266af2defa946')
  for (const endpoint of graphUrls) {
    const key = `pooltogether/${api.chain}/${endpoint.split('pooltogether/')[1]}`
    const { prizePools } = await cachedGraphQuery(key, endpoint, GRAPH_QUERY,)
    pools.push(...prizePools.map(i => i.id))
  }
  const tokens = await api.multiCall({  abi: 'address:token', calls: pools})  
  const bals = await api.multiCall({  abi: abi.accountedBalance, calls: pools})
  api.addTokens(tokens, bals)
  return api.getBalances()
}

module.exports = {
  tvl,
}
