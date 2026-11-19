const { ethers } = require('ethers')
const { tickToPrice } = require('../helper/utils/tick')

const FACTORY = '0xbFA531C90FD9e42aC13Af14823B30e40761dd3A2'
const HOOK = '0x8bb4516059F9149Bc3b89018Fc7537f1F14a30cc'
// Standard Uniswap V4 PoolManager._pools mapping storage slot for slot0 extsload reads;
// verified against Ink StateView.getSlot0 (0x76fd297e2d437cd7f76d50f01afe6160f86e9990).
const POOLS_SLOT = 6

const abiCoder = ethers.AbiCoder.defaultAbiCoder()

function addV4PositionAmounts(api, { currency0, currency1, liquidity, tickLower, tickUpper, sqrtPriceX96 }) {
  if (liquidity <= 0n || sqrtPriceX96 <= 0n) return

  const L = Number(liquidity)
  const sp = Number(sqrtPriceX96) / 2 ** 96
  const sa = tickToPrice(tickLower / 2)
  const sb = tickToPrice(tickUpper / 2)

  let amount0 = 0
  let amount1 = 0
  if (sp <= sa) {
    amount0 = (L * (sb - sa)) / (sa * sb)
  } else if (sp >= sb) {
    amount1 = L * (sb - sa)
  } else {
    amount0 = (L * (sb - sp)) / (sp * sb)
    amount1 = L * (sp - sa)
  }

  if (amount0 > 0) api.add(currency0, Math.floor(amount0))
  if (amount1 > 0) api.add(currency1, Math.floor(amount1))
}

async function tvl(api) {
  await api.getBlock()
  const [poolManager, usdg, stockCount] = await Promise.all([
    api.call({ abi: 'address:poolManager', target: FACTORY }),
    api.call({ abi: 'address:usdg', target: FACTORY }),
    api.call({ abi: 'uint256:stockCount', target: FACTORY }),
  ])

  const count = Number(stockCount)
  if (!count) return

  const stocks = await api.multiCall({
    abi: 'function allStocks(uint256) view returns (address)',
    target: FACTORY,
    calls: Array.from({ length: count }, (_, i) => i),
  })

  const rawVaults = await api.multiCall({
    abi: 'function vaultOf(address) view returns (address)',
    target: FACTORY,
    calls: stocks,
  })

  const activePairs = stocks
    .map((stock, i) => ({ stock, vault: rawVaults[i] }))
    .filter(({ vault }) => vault && vault !== ethers.ZeroAddress)
  if (!activePairs.length) return

  const activeStocks = activePairs.map((p) => p.stock)
  const vaults = activePairs.map((p) => p.vault)

  const [poolIds, tickLowers, tickUppers, liquidities, currency0s, currency1s, vaultUsdg, vaultStock] =
    await Promise.all([
      api.multiCall({ abi: 'bytes32:poolId', calls: vaults.map((v) => ({ target: v })) }),
      api.multiCall({ abi: 'int24:tickLower', calls: vaults.map((v) => ({ target: v })) }),
      api.multiCall({ abi: 'int24:tickUpper', calls: vaults.map((v) => ({ target: v })) }),
      api.multiCall({ abi: 'uint128:positionLiquidity', calls: vaults.map((v) => ({ target: v })) }),
      api.multiCall({ abi: 'address:currency0', calls: vaults.map((v) => ({ target: v })) }),
      api.multiCall({ abi: 'address:currency1', calls: vaults.map((v) => ({ target: v })) }),
      api.multiCall({ abi: 'erc20:balanceOf', calls: vaults.map((v) => ({ target: usdg, params: v })) }),
      api.multiCall({ abi: 'erc20:balanceOf', calls: vaults.map((v, i) => ({ target: activeStocks[i], params: v })) }),
    ])

  const lpPots = await api.multiCall({
    abi: 'function lpPot(bytes32) view returns (uint256)',
    target: HOOK,
    calls: poolIds,
  })

  const slots = poolIds.map((id) => ethers.keccak256(abiCoder.encode(['bytes32', 'uint256'], [id, POOLS_SLOT])))
  const slot0Raw = await api.multiCall({
    abi: 'function extsload(bytes32) view returns (bytes32)',
    target: poolManager,
    calls: slots,
  })

  for (let i = 0; i < vaults.length; i++) {
    const sqrtPriceX96 = BigInt(slot0Raw[i]) & ((1n << 160n) - 1n)
    addV4PositionAmounts(api, {
      currency0: currency0s[i],
      currency1: currency1s[i],
      liquidity: BigInt(liquidities[i]),
      tickLower: Number(tickLowers[i]),
      tickUpper: Number(tickUppers[i]),
      sqrtPriceX96,
    })

    // Vault USDG balance covers eligible idle USDG plus harvested LP fee entitlements (dividendReserve);
    // hook.lpPot holds unharvested LP fees that _harvest() moves into the vault's dividendReserve.
    const usdgBal = BigInt(vaultUsdg[i])
    if (usdgBal > 0n) api.add(usdg, usdgBal.toString())

    const stockBal = BigInt(vaultStock[i])
    if (stockBal > 0n) api.add(activeStocks[i], stockBal.toString())

    const lpPot = BigInt(lpPots[i])
    if (lpPot > 0n) api.add(usdg, lpPot.toString())
  }
}

module.exports = {
  doublecounted: true,
  methodology:
    'Tracks the underlying Uniswap V4 LP positions, vault-held idle balances and harvested LP fee entitlements, plus hook-held unharvested LP fee entitlements (lpPot) across all active Quotrons stock LP vaults on Ink.',
  ink: {
    tvl,
  },
}
