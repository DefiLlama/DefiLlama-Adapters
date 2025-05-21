const sdk = require("@defillama/sdk");
const indexAbi = require("./abis/Index.abi.json");
const vTokenAbi = require("./abis/vToken.abi.json");
const vTokenFactoryAbi = require("./abis/vTokenFactory.abi.json");
const networks = require("./networks.json");
const { sumERC4626Vaults } = require("../helper/erc4626");
const { getUniqueAddresses } = require("../helper/utils");

const indexTvl = async (api) => {
  const { indexes } = networks[api.chain]
  const anatomy = (await api.multiCall({ abi: indexAbi.anatomy, calls: indexes })).map(i => i._assets)
  const inactiveAnatomy = await api.multiCall({ abi: indexAbi.inactiveAnatomy, calls: indexes })
  const vFactories = await api.multiCall({ abi: indexAbi.vTokenFactory, calls: indexes })
  const indexTokens = anatomy.map((v, i) => getUniqueAddresses(v.concat(inactiveAnatomy[i])))
  const tokens = []
  const vTokenCalls = []
  vFactories.forEach((v, i) => {
    indexTokens[i].forEach((token) => {
      tokens.push(token)
      vTokenCalls.push({ target: v, params: token })
    })
  })
  const vTokenOf = await api.multiCall({ abi: vTokenFactoryAbi.vTokenOf, calls: vTokenCalls })
  const bals = await api.multiCall({ abi: vTokenAbi.virtualTotalAssetSupply, calls: vTokenOf })
  api.add(tokens, bals)
  return api.getBalances()
};

const savingsVaultTvl = async (api) => {
  const calls = networks[api.chain]["savingsVaults"]
  return sumERC4626Vaults({ api, calls, isOG4626: true, permitFailure: true })
};

module.exports = {
  methodology: "TVL considers tokens deposited to Phuture Products",
  misrepresentedTokens: true,
  ethereum: {
    tvl: sdk.util.sumChainTvls([
      indexTvl,
      savingsVaultTvl
    ])
  },
  avax: {
    tvl: indexTvl
  }
};
