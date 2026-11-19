const ADDRESSES = require('../helper/coreAssets.json')

const PALPHA = '0xE47E9bA4EA2320A6ed87246d02Fd5C38485Ed7d1'
const WAD = 10n ** 18n

const AMM_POOLS = [
  {
    name: 'pAlpha',
    poolId: '0x12e8e4f5d37f7fa03a0da9b547cd31c2c1394dce0069371d96e2e6439ee9f673',
    swapHook: '0x958a6E98203FE71Ae3A30c515D4705cb73C2Aa88',
    token0: '0x34fD642Fa9fDc6Ce4013d4F3cde575C6dac904f9',
    token1: '0xe150A72352a189dCe0D671C08F721B458104a2Af',
    fee: 3000,
    tickSpacing: 60,
  },
]

async function tvl(api) {
  let total = 0n

  // Each AquaFlux AMM pool is a PT/AQ stable swap market implemented through Uniswap v4 hook.
  for (const pool of AMM_POOLS) {
    const poolInfo = await api.call({
      abi: 'function poolInfo(bytes32 id) view returns (tuple(bool configured,bool isPToken0,uint256 valuationStart,uint256 maturity,uint256 pInitialValue,uint256 pMaturityValue,uint256 underlyingInitialValue,uint256 underlyingMaturityValue,uint256 amplification,uint256 creditLayer,uint256 pTokenScale,uint256 underlyingTokenScale,uint256 swapFeeRate,uint128 reserveP,uint128 reserveUnderlying,uint256 totalShares,address lpToken,bool paused))',
      target: pool.swapHook,
      params: [pool.poolId],
    })

    // PT is a principal tranche token, and value it with the AquaFlux Rate Hook's on-chain principal value for the AMM pool.
    const pValue = await api.call({
      abi: 'function pValue((address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key) view returns (uint256)',
      target: pool.swapHook,
      params: [[pool.token0, pool.token1, pool.fee, pool.tickSpacing, pool.swapHook]],
    })
    const pAssets = BigInt(poolInfo.reserveP) * BigInt(pValue) / WAD

    // AQ Token reserves are underlying wrapped exposure;
    // e.g. AQ-pAlpha represents pAlpha 1:1 backed wrapped exposure, and value it through pAlpha.convertToAssets.
    const aqAssets = await api.call({
      abi: 'function convertToAssets(uint256 shares) view returns (uint256 assets)',
      target: PALPHA,
      params: [poolInfo.reserveUnderlying],
    })

    total += pAssets + BigInt(aqAssets)
  }

  api.add(ADDRESSES.pharos.USDC, total)
}

module.exports = {
  methodology:
    'Counts liquidity supplied to AquaFlux AMM pools.',
  pharos: {
    tvl,
  },
}
