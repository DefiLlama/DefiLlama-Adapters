const { SYNTHETIC_TOKENS, SYNTHETIC_STAKING } = require("./constants")

const stakings = async (api) => {
  const { chain } = api
  const synthTokens = Object.values(SYNTHETIC_TOKENS[chain])
  const synthBalances = await api.multiCall({
    calls: synthTokens.map(token => ({
      target: token,
      params: [SYNTHETIC_STAKING[chain]]
    })),
    abi: 'erc20:balanceOf',
  })
  const underlyingAssets = await api.multiCall({
    calls: synthTokens.map(token => ({
      target: token,
      params: []
    })),
    abi: 'address:underlyingAsset',
  })
  const underlyingAssetDecimals = await api.multiCall({
    calls: underlyingAssets.map(token => ({
      target: token,
      params: []
    })),
    abi: 'erc20:decimals',
  })
  const correctedBalances = synthBalances.map((balance, index) => 
    BigInt(underlyingAssetDecimals[index]) < 18n ?
      BigInt(balance) / 10n ** (18n - BigInt(underlyingAssetDecimals[index])) :
      BigInt(balance) * 10n ** (BigInt(underlyingAssetDecimals[index]) - 18n)
  )
  
  api.add(underlyingAssets, correctedBalances)
}

module.exports = {
  methodology: "TVL is the total value of the assets that back synthetic tokens in staking pools on a specific chain.",
  ethereum: {
    tvl: () => ({}),
    staking: stakings,
  },
  polygon: {
    tvl: () => ({}),
    staking: stakings,
  }
};