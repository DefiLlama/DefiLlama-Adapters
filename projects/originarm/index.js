const ADDRESSES = require('../helper/coreAssets.json')

const OETH = "0x856c4Efb76C1D1AE02e20CEB03A2A6a08b0b8dC3"
const OS = "0xb1e25689D55734FD3ffFc939c4C3Eb52DFf8A794"

// Multi-base ARM (upgraded AbstractARM) reads. Legacy ARMs revert on getBaseAssets().
const baseAssetConfigsAbi = "function baseAssetConfigs(address asset) view returns (uint128 buyPrice, uint128 sellPrice, uint128 buyLiquidityRemaining, uint128 sellLiquidityRemaining, uint128 crossPrice, uint120 pendingRedeemAssets, bool peggedToLiquidityAsset, address adapter)"
const convertToAssetsAbi = "function convertToAssets(uint256 shares) view returns (uint256 assets)"

// Every Origin ARM. Each is either still on its original single-base implementation (a
// protocol-specific withdrawal queue) or upgraded to the multi-base AbstractARM
// (getBaseAssets / baseAssetConfigs). Which one is detected at runtime per ARM, so the rollout
// can proceed without touching this adapter. `liquidity`/`base`/`legacyOutstanding` are only
// used on the legacy path; the multi-base path reads liquidityAsset() and getBaseAssets() live.
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
  ],
  sonic: [
    // OS ARM
    { arm: "0x2F872623d1E1Af5835b08b0E49aAd2d81d649D30", liquidity: ADDRESSES.sonic.wS, base: OS, legacyOutstanding: "uint256:vaultWithdrawalAmount" },
  ],
}

const tvl = async (api) => {
  const arms = ARMS[api.chain]
  // getBaseAssets() reverts on not-yet-upgraded ARMs -> null; a non-null array marks a multi-base ARM.
  const baseAssetsList = await api.multiCall({ abi: "address[]:getBaseAssets", calls: arms.map((a) => a.arm), permitFailure: true })

  const tokensAndOwners = []
  await Promise.all(arms.map(async ({ arm, liquidity, base, legacyOutstanding }, i) => {
    const baseAssets = baseAssetsList[i]

    if (baseAssets) {
      // Multi-base ARM. Everything is valued in liquidity-asset terms, mirroring the contract's
      // _availableAssets(): idle liquidity + on-hand base assets + lending market + pending redemptions.
      const [liquidityAsset, activeMarket] = await Promise.all([
        api.call({ abi: "address:liquidityAsset", target: arm }),
        api.call({ abi: "address:activeMarket", target: arm }),
      ])
      // On-hand liquidity asset + every registered base asset (each priced natively by DefiLlama).
      tokensAndOwners.push([liquidityAsset, arm], ...baseAssets.map((b) => [b, arm]))
      // Lending-market position: value the ARM's ERC4626 shares in liquidity-asset terms.
      if (activeMarket && activeMarket.toLowerCase() !== ADDRESSES.null) {
        const shares = await api.call({ abi: "erc20:balanceOf", target: activeMarket, params: [arm] })
        if (shares !== "0") {
          const marketAssets = await api.call({ abi: convertToAssetsAbi, target: activeMarket, params: [shares] })
          api.add(liquidityAsset, marketAssets)
        }
      }
      // Pending protocol redemptions per base asset (adapter withdrawal queues). pendingRedeemAssets
      // is already liquidity-denominated (the assets expected back from the adapter), so add it as the
      // liquidity asset rather than the base asset.
      const configs = await api.multiCall({ abi: baseAssetConfigsAbi, target: arm, calls: baseAssets.map((b) => ({ params: [b] })) })
      configs.forEach((cfg) => api.add(liquidityAsset, cfg.pendingRedeemAssets))
    } else {
      // Legacy single-base ARM: outstanding protocol withdrawal is denominated in the base asset.
      const outstanding = await api.call({ abi: legacyOutstanding, target: arm })
      api.add(base, outstanding)
      tokensAndOwners.push([liquidity, arm], [base, arm])
    }
  }))

  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: { tvl },
  sonic: { tvl },
}
