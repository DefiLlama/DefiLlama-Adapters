const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const contracts = require("./contracts.json");
const { pool2 } = require("../helper/pool2");
const vaults = [
  contracts.ftmVault,
  contracts.ethVault,
  contracts.avaxVault,
  contracts.tombVault,
]

const tokens = [
  contracts.FTM,
  contracts.WETH,
  contracts.AVAX,
  contracts.TOMB,
]

async function tvl(api) {
  const _tokens = [...tokens]
  const owners = [...vaults, ...vaults]
  vaults.forEach(v => _tokens.push(contracts.Collateral))
  return api.sumTokens({ tokensAndOwners2: [_tokens, owners] })
}

async function borrowed(api) {
  const vaults0 = vaults.slice(0, 2);
  const vaults1 = vaults.slice(2);
  const tokens0 = tokens.slice(0, 2);
  const tokens1 = tokens.slice(2);
  const balances = await api.multiCall({ abi: abi.see_s1ftm_circ, calls: vaults0 })
  const balances1 = await api.multiCall({ abi: abi.see_s1tomb_circ, calls: vaults1 })
  api.addTokens(tokens0, balances)
  api.addTokens(tokens1, balances1)

  const chainApi = new sdk.ChainApi({ chain: api.chain, block: api.block })
  chainApi.sumTokens({ tokensAndOwners2: [tokens, vaults] })
  Object.entries(chainApi.getBalances()).forEach(([token, balance]) => {
    api.add(token, balance * -1, { skipChain: true })
  })
  return api.getBalances()
}

module.exports = {
  fantom: {
    tvl,
    borrowed,
    pool2: pool2(
      [contracts.pool2, contracts.pool2],
      [contracts.daiPool2, contracts.ftmPool2],
    )
  }
}
