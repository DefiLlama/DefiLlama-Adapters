const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, } = require('../helper/unwrapLPs')

async function tvl(api) {
  
  return sumTokens2({ owners: [
    '0x37fc73b4dda9f7263926590838e32e05e4e051e9',
  ], tokens: [ADDRESSES.btr.WBTC, ADDRESSES.btr.USDT], api, }) //wbtc and usdt
}

module.exports = {
  btr: { tvl, }
}
/* 
const config = {
  btr: { query: '0x3622a84D5861d25aA064512E3F244Dd8e67Dc22B', },

}
const abis = {
  "listCollaterals": "function listCollaterals() view returns ((string name, uint256 maxLTV, uint256 liquidationFeeRate, uint256 stabilityFeeRate, bytes32 collateralId, (address tokenAddress, uint256 safetyFactor, uint256 totalDebt, uint256 totalLocked, uint256 vaultMaxDebt, uint256 vaultMinDebt, uint256 maxDebt) collateral)[] collateralInfos)",
}

Object.keys(config).forEach(chain => {
  const { query,} = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const res = await api.call({  abi: abis.listCollaterals, target: query})
      res.forEach(({ collateral}) => api.add(collateral.tokenAddress, collateral.totalLocked))
    }
  }
}) */