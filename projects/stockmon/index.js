const ADDRESSES = require('../helper/coreAssets.json')

// Vaults by collection.
const VAULTS = [
  "0xb78edcb4de39355747c62e6d55209c01a2294ad8", // Genesis Vault
];
// Aetheryn birth vaults: each Aetheryn's MON is held here until its owner redeems it.
const AETHERYN_BIRTH_VAULTS = [
  "0xa54221b56837d5f3707d0ed9883a01edf7dae2cf", // Aetheryn Birth Vault (Breeding v3)
  "0xad2a6cbdb2c1b01c19d52585eee75b8e86f9989a", // Aetheryn Birth Vault (Breeding v4)
];
const WETH = ADDRESSES.robinhood.WETH.toLowerCase()
const MON = "0x7c646a41572b441527169c576ef0c0a40c667777"
// MON is not priced by the coins server on Robinhood Chain yet, so it is valued in WETH
// from the MON/WETH Uniswap v2 pool.
const MON_WETH_PAIR = "0x0390e65412d4704a612997432e4eea8b7688232b"

async function tvl(api) {
  const assetRegistry = await api.call({ abi: 'address:assetRegistry', target:'0xb78edcb4de39355747c62e6d55209c01a2294ad8' });
  const stocks = await api.fetchList({  lengthAbi: 'ASSET_COUNT', itemAbi: 'function assetAt(uint8) view returns (address)', target: assetRegistry})
  const tokens = stocks.concat([WETH])
  await api.sumTokens({ tokens, owners: VAULTS })

  // Treasury revenue remains in the vault until claimed, but it is not user TVL.
  const claimableTreasuryWeth = await api.multiCall({
    abi: 'uint256:claimableNonStockQuote',
    calls: VAULTS.map(target => ({ target })),
  })
  const totalClaimableTreasuryWeth = claimableTreasuryWeth.reduce(
    (total, amount) => total + BigInt(amount), 0n
  )
  api.add(WETH, (-totalClaimableTreasuryWeth).toString())

  // Aetheryn birth vaults (MON backing each Aetheryn), valued in WETH.
  const monBalances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: AETHERYN_BIRTH_VAULTS.map(owner => ({ target: MON, params: [owner] })),
  })
  const totalMon = monBalances.reduce((total, amount) => total + BigInt(amount), 0n)
  const [token0, reserves] = await Promise.all([
    api.call({ abi: 'address:token0', target: MON_WETH_PAIR }),
    api.call({ abi: 'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)', target: MON_WETH_PAIR }),
  ])
  const monIsToken0 = token0.toLowerCase() === MON
  const reserveMon = BigInt(monIsToken0 ? reserves.reserve0 : reserves.reserve1)
  const reserveWeth = BigInt(monIsToken0 ? reserves.reserve1 : reserves.reserve0)
  if (reserveMon > 0n) api.add(WETH, (totalMon * reserveWeth / reserveMon).toString())

  return api.getBalances()
}

module.exports = {
  methodology: "Value of stock tokens and holder-backed WETH held in STOCKMON vaults, excluding WETH claimable by the protocol treasury, plus the MON held in the Aetheryn birth vaults (Breeding v3 and v4) that backs each Aetheryn, valued in WETH from the MON/WETH Uniswap v2 pool",
  misrepresentedTokens: true,
  robinhood: {
    tvl
  },
};
