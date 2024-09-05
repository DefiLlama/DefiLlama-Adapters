const sdk = require("@defillama/sdk");
const abi = {
  "bdstable_pools_array": "function bdstable_pools_array(uint256) view returns (address)",
  "getBdStablesPoolsLength": "uint256:getBdStablesPoolsLength",
  "getBDStablePoolCollateral": "address:collateral_token",
  "getBDStable": "function bdstables(uint256) view returns (address)",
  "getBdStablesLength": "uint256:getBdStablesLength",
  "getBDXPriceUsdD12": "uint256:BDX_price_d12"
}
const { getUniTVL, } = require("../helper/unknownTokens");

const chains = {
  rsk: {
    bdxTokenAddress: "0x6542a10E68cEAc1Fa0641ec0D799a7492795AAC1",
  },
};

async function tvl(api) {
  const bdstables = await api.fetchList({ lengthAbi: abi.getBdStablesLength, itemAbi: abi.getBDStable, target: chains.rsk.bdxTokenAddress })
  await Promise.all(bdstables.map(async bdstable => {
    const pools = await api.fetchList({  lengthAbi: abi.getBdStablesPoolsLength, itemAbi: abi.bdstable_pools_array, target: bdstable})
    const tokens = await api.multiCall({  abi: abi.getBDStablePoolCollateral, calls: pools})
    await api.sumTokens({ tokensAndOwners2:[tokens, pools,]})
  }))
  return api.getBalances()
}

const dexTVL = getUniTVL({
  factory: '0x5Af7cba7CDfE30664ab6E06D8D2210915Ef73c2E',
  useDefaultCoreAssets: true,
})

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "(1) AMM LP pairs - All the liquidity pools from the Factory address are used to find the LP pairs. (2) Collateral - All the collateral being used to support the stable coins - Bitcoin, Ethereum & BDX",
  rsk: {
    tvl: sdk.util.sumChainTvls([tvl, dexTVL]),
  },
};
