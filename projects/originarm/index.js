const ADDRESSES = require('../helper/coreAssets.json')

const OETH = "0x856c4Efb76C1D1AE02e20CEB03A2A6a08b0b8dC3"
const OS = "0xb1e25689D55734FD3ffFc939c4C3Eb52DFf8A794"

// Multi-base ARM (upgraded AbstractARM) reads. Legacy ARMs revert on getBaseAssets().
const baseAssetConfigsAbi = "function baseAssetConfigs(address asset) view returns (uint128 buyPrice, uint128 sellPrice, uint128 buyLiquidityRemaining, uint128 sellLiquidityRemaining, uint128 crossPrice, uint120 pendingRedeemAssets, bool peggedToLiquidityAsset, address adapter)"
const convertToAssetsAbi = "function convertToAssets(uint256 shares) view returns (uint256 assets)"

// Every Origin ARM. Older ARMs launched with a single base asset (a protocol-specific withdrawal
// queue); newer ones are born multi-asset on the AbstractARM (getBaseAssets / baseAssetConfigs), and
// single-base ARMs are being upgraded to it too. Which shape an ARM has is detected at runtime, so
// the rollout needs no adapter change. `base`/`legacyOutstanding` only apply to the legacy path; the
// multi-base path reads liquidityAsset() and getBaseAssets() live. Multi-asset ARMs set only
// `liquidity` (used to value the lending market before getBaseAssets resolves).
const ARMS = {
  ethereum: [
    // Lido ARM
    { arm: "0x85b78aca6deae198fbf201c82daf6ca21942acc6", liquidity: ADDRESSES.ethereum.WETH, base: ADDRESSES.ethereum.STETH, legacyOutstanding: "uint256:lidoWithdrawalQueueAmount" },
    // OETH ARM
    { arm: "0x6bac785889A4127dB0e0CeFEE88E0a9F1Aaf3cC7", liquidity: ADDRESSES.ethereum.WETH, base: OETH, legacyOutstanding: "uint256:vaultWithdrawalAmount" },
    // Ether.fi ARM
    { arm: "0xfB0A3CF9B019BFd8827443d131b235B3E0FC58d2", liquidity: ADDRESSES.ethereum.WETH, base: ADDRESSES.ethereum.EETH, legacyOutstanding: "uint256:etherfiWithdrawalQueueAmount" },
    // Ethena ARM
    { arm: "0xCEDa2d856238aA0D12f6329de20B9115f07C366d", liquidity: ADDRESSES.ethereum.USDe, base: ADDRESSES.ethereum.sUSDe, legacyOutstanding: "uint256:liquidityAmountInCooldown" },
    // Multi-asset WETH ARM (bases: stETH/wstETH/eETH/weETH)
    { arm: "0x68025a4615407993a680102b08a23a61d11c657c", liquidity: ADDRESSES.ethereum.WETH },
    // Multi-asset USDC ARM (bases: PYUSD/USDG)
    { arm: "0x9e3a7026e5767f2d7ff5e83b0ed011005f45a170", liquidity: ADDRESSES.ethereum.USDC },
  ],
  sonic: [
    // OS ARM
    { arm: "0x2F872623d1E1Af5835b08b0E49aAd2d81d649D30", liquidity: ADDRESSES.sonic.wS, base: OS, legacyOutstanding: "uint256:vaultWithdrawalAmount" },
  ],
}

const tvl = async (api) => {
  const arms = ARMS[api.chain]
  // getBaseAssets() legitimately reverts on not-yet-upgraded (legacy) ARMs -> null; a non-null array
  // marks a multi-base ARM. permitFailure exists only to distinguish that legacy case, resolved per
  // ARM below. activeMarket() exists on every ARM generation, so a failed read there is operational:
  // let it throw and fail the refresh rather than silently dropping the market balance from TVL.
  const [baseAssetsList, activeMarkets] = await Promise.all([
    api.multiCall({ abi: "address[]:getBaseAssets", calls: arms.map((a) => a.arm), permitFailure: true }),
    api.multiCall({ abi: "address:activeMarket", calls: arms.map((a) => a.arm) }),
  ])

  const tokensAndOwners = []
  await Promise.all(arms.map(async ({ arm, liquidity, base, legacyOutstanding }, i) => {
    const baseAssets = baseAssetsList[i]
    // Liquidity asset the ARM's market position and redemptions are denominated in. Read live on the
    // multi-base path, hardcoded on the legacy path.
    let liquidityAsset = liquidity

    if (baseAssets) {
      // Multi-base ARM: idle liquidity asset + every registered base asset + per-base pending
      // redemptions. pendingRedeemAssets is already liquidity-denominated (assets expected back from
      // the adapter), so add it as the liquidity asset rather than the base asset.
      liquidityAsset = await api.call({ abi: "address:liquidityAsset", target: arm })
      tokensAndOwners.push([liquidityAsset, arm], ...baseAssets.map((b) => [b, arm]))
      const configs = await api.multiCall({ abi: baseAssetConfigsAbi, target: arm, calls: baseAssets.map((b) => ({ params: [b] })) })
      configs.forEach((cfg) => api.add(liquidityAsset, cfg.pendingRedeemAssets))
    } else if (legacyOutstanding) {
      // Legacy single-base ARM: getBaseAssets() reverts pre-upgrade, so a null result is expected
      // here. Outstanding protocol withdrawal is denominated in the base asset.
      const outstanding = await api.call({ abi: legacyOutstanding, target: arm })
      api.add(base, outstanding)
      tokensAndOwners.push([liquidity, arm], [base, arm])
    } else {
      // Multi-asset ARM with no single-base fallback: a null getBaseAssets() can only be a failed read,
      // not the legacy signal, so fail the refresh instead of silently dropping this ARM's balances.
      throw new Error(`originarm: getBaseAssets() returned no result for multi-asset ARM ${arm}`)
    }

    // Active lending-market position (both ARM generations). The operator moves funds in and out of
    // the market over time, so value the ARM's ERC4626 market shares live, in liquidity-asset terms.
    const activeMarket = activeMarkets[i]
    if (activeMarket && activeMarket.toLowerCase() !== ADDRESSES.null) {
      const shares = await api.call({ abi: "erc20:balanceOf", target: activeMarket, params: [arm] })
      if (shares !== "0") {
        const marketAssets = await api.call({ abi: convertToAssetsAbi, target: activeMarket, params: [shares] })
        api.add(liquidityAsset, marketAssets)
      }
    }
  }))

  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: { tvl },
  sonic: { tvl },
}
