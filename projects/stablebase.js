const { staking } = require('./helper/staking')

const stableABI = {
  getTokens: "address[]:getTokens",
  getLpToken: "address:getLpToken",
}

const registryABI = {
  poolAddresses: "address[]:poolAddresses",
}

async function stablePoolTVL(api) {
  const pools= await api.call({  abi: registryABI.poolAddresses, target: '0x9595037e6d4a37e0659e66937ee6f7f88f4b0446'})
  const tokens = await api.multiCall({  abi: stableABI.getTokens, calls: pools,})
  return api.sumTokens({ ownerTokens: pools.map((v, i) => [tokens[i], v])})
}

module.exports = {
  base: {
    tvl: stablePoolTVL,
    staking: staking('0xDB4ad0C533AeB2faC1B10fa60207BE039084C33F', '0x616F5b97C22Fa42C3cA7376F7a25F0d0F598b7Bb')
  }
}