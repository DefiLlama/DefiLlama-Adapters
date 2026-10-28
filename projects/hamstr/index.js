// Hamstr (https://www.hamstr.online) – principal stays in USDC/ETH, only the yield is swapped into cbBTC.
// Source and contracts: https://github.com/gabbergandalfderreiche/hamstr

// BtcYieldVaults: principal lent on Aave V3 via a strategy; totalAssets() = principal in the vault's asset.
const VAULTS = [
  '0x3647c58c7eF2f4E871Cb3390E21ddD211242aADA', // Dollar Hamster (USDC)
  '0xBF5Cd7EB5D3fC9625A1cf96C29802811f9335f2a', // ETH Hamster (WETH)
]

// TurboVault: Uniswap V3 WETH/cbBTC position; totalAssets() = depositors' share valued in WETH (Chainlink price).
const TURBO_VAULT = '0xd303E417Afd36f82A06f37736FBF8Db71fd952e6'

async function tvl(api) {
  const assets = await api.multiCall({ abi: 'address:asset', calls: VAULTS })
  const totals = await api.multiCall({ abi: 'uint256:totalAssets', calls: VAULTS })
  api.add(assets, totals)

  // Harvested yield waiting to be claimed sits in the vaults as cbBTC.
  const cbbtc = await api.call({ abi: 'address:rewardToken', target: VAULTS[0] })
  await api.sumTokens({ owners: VAULTS, tokens: [cbbtc] })

  const weth = await api.call({ abi: 'address:weth', target: TURBO_VAULT })
  const turbo = await api.call({ abi: 'uint256:totalAssets', target: TURBO_VAULT })
  api.add(weth, turbo)
}

module.exports = {
  methodology:
    'Assets deposited in the Hamstr vaults on Base: USDC and ETH principal (lent on Aave V3), unclaimed cbBTC rewards held by the vaults, and the Turbo vault\'s Uniswap V3 WETH/cbBTC position valued via its totalAssets().',
  doublecounted: true, // principal is also counted in Aave V3 and Uniswap V3
  start: '2026-10-26',
  base: { tvl },
}
