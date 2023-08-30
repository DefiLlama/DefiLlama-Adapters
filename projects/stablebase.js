const ADDRESSES = require('./helper/coreAssets.json')
const { staking } = require('./helper/staking')
const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('./helper/unwrapLPs')

const stableABI = {
  getTokens: "address[]:getTokens",
  getLpToken: "address:getLpToken",
}

const registryABI = {
  poolAddresses: "address[]:poolAddresses",
}

const chain = 'base'
async function stablePoolTVL(_, block, _cb, { api }) {

  const registryResponse = (
    await sdk.api.abi.multiCall({
      calls: [{
        target: '0x9595037e6d4a37e0659e66937ee6f7f88f4b0446',
      }],
      abi: registryABI["poolAddresses"],
      chain,
      permitFailure: true,
    })
  ).output
  
  const pools = registryResponse[0].output

  let { output: lpTokens } = await sdk.api.abi.multiCall({
    abi: stableABI.getLpToken,
    calls: pools.map(i => ({ target: i })),
    chain,
    block
  })

  lpTokens = lpTokens.map(i => i.output.toLowerCase())
  const { output: tokens } = await sdk.api.abi.multiCall({
    abi: stableABI.getTokens,
    calls: pools.map(i => ({ target: i })),
    chain, block,
  })

  const toa = []
  tokens.forEach(res => {
    res.output.forEach(t => {
      if (lpTokens.includes(t.toLowerCase())) return;
      toa.push([t, res.input.target])
    })
  })

  return sumTokens2({ tokensAndOwners: toa, chain, block, })
}

module.exports = {
  misrepresentedTokens: true,
  base: {
    tvl: stablePoolTVL,
    staking: staking('0xDB4ad0C533AeB2faC1B10fa60207BE039084C33F', '0x616F5b97C22Fa42C3cA7376F7a25F0d0F598b7Bb', 'base')
  }
}