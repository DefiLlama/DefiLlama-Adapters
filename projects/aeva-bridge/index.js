const ADDRESSES = require('../helper/coreAssets.json')

// Hyperlane HypERC20Collateral routers (core 12.1.0) holding the bridged collateral on Robinhood Chain
const AEVA = '0xe8729Dc9dCA85167e06b7E9c66a58b22457c5F30'
const AEVA_ROUTER = '0xA880B6e6511DAF5A0Bdde96EE8b36D8004D9D7eD'
const USDG_ROUTER = '0x856a649A84C8c6bB1e2541097bB293af5DD57857'

async function tvl(api) {
  const tokens = [AEVA, ADDRESSES.robinhood.USDG]
  const routers = [AEVA_ROUTER, USDG_ROUTER]
  const [balances, lpDeposits] = await Promise.all([
    api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map((target, i) => ({ target, params: routers[i] })) }),
    // each router is also an ERC-4626 vault: totalAssets() is what LPs deposited, which backs no bridged tokens
    api.multiCall({ abi: 'uint256:totalAssets', calls: routers }),
  ])
  const [aevaLocked, usdgLocked] = balances.map((balance, i) => BigInt(balance) - BigInt(lpDeposits[i]))
  // $AEVA has no price on Robinhood Chain; CoinGecko's `aeva` is this contract
  api.addCGToken('aeva', Number(aevaLocked) / 1e18)
  api.add(ADDRESSES.robinhood.USDG, usdgLocked.toString())
}

module.exports = {
  methodology: "Counts the $AEVA and USDG locked in the Aeva bridge's two Hyperlane collateral routers on Robinhood Chain, which back the AEVA and aeUSD bridged to Aeva Mainnet. The routers are also ERC-4626 vaults; liquidity providers' deposits in them (totalAssets) are excluded.",
  start: '2026-09-28',
  robinhood: { tvl },
}
