const ADDRESSES = require('../helper/coreAssets.json')

const CORE = '0x0da98a8447b6B4aDD9733011A812922954d3e127'
const WAD = 10n ** 18n

const ASSETS = [
  {
    name: 'pAlpha',
    assetId: '0xbb48f16cbb1bf38267d547b2edc8d0994aca6925ab0ec264f38d6db4ca10fcb2',
    underlying: '0xE47E9bA4EA2320A6ed87246d02Fd5C38485Ed7d1',
    swapHook: '0x958a6E98203FE71Ae3A30c515D4705cb73C2Aa88',
    token0: '0x34fD642Fa9fDc6Ce4013d4F3cde575C6dac904f9',
    token1: '0xe150A72352a189dCe0D671C08F721B458104a2Af',
    fee: 3000,
    tickSpacing: 60,
  },
]

async function tvl(api) {
  const balances = await api.multiCall({
    abi: 'function getAssetUnderlyingBalance(bytes32 assetId) view returns (uint256 balance)',
    calls: ASSETS.map(({ assetId }) => ({
      target: CORE,
      params: [assetId],
    })),
  })

  const underlyingValues = await api.multiCall({
    abi: 'function underlyingValue((address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key) view returns (uint256)',
    calls: ASSETS.map(({ swapHook, token0, token1, fee, tickSpacing }) => ({
      target: swapHook,
      params: [[token0, token1, fee, tickSpacing, swapHook]],
    })),
  })

  balances.forEach((balance, i) => {
    const usdBalance = BigInt(balance) * BigInt(underlyingValues[i]) / WAD
    api.add(ADDRESSES.pharos.USDC, usdBalance)
  })
}

module.exports = {
  methodology:
    'Counts active assets locked in AquaFluxCore contracts.',
  pharos: {
    tvl,
  },
}
