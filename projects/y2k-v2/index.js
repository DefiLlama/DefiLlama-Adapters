const { sumTokens2, } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

const config = {
  arbitrum: [{ factory: '0xC3179AC01b7D68aeD4f27a19510ffe2bfb78Ab3e', fromBlock: 96059531, }, { factory: '0x442Fd67F2CcF92eD73E7B7E4ff435835EcA890C9', fromBlock: 141345832, },],
}


Object.keys(config).forEach(chain => {
  const _config = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = (await Promise.all(_config.map(({ factory, fromBlock, }) => getLogs({
        api,
        target: factory,
        topics: ['0xe8066e93c2c1e100c0c76002a546075b7c6b53025db53708875180c81afda250'],
        eventAbi: 'event MarketCreated (uint256 indexed marketId, address premium, address collateral, address underlyingAsset, address token, string name, uint256 strike, address controller)',
        onlyArgs: true,
        fromBlock,
      })))).flat()

      const premiums = logs.map(i => i.premium)
      const collaterals = logs.map(i => i.collateral)
      const pTokens = await api.multiCall({ abi: 'address:asset', calls: premiums })
      const cTokens = await api.multiCall({ abi: 'address:asset', calls: collaterals })
      return sumTokens2({ api, tokensAndOwners2: [[...pTokens, ...cTokens], [...premiums, ...collaterals]] })
    }
  }
})

