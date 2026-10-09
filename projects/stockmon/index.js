const ADDRESSES = require('../helper/coreAssets.json')

// Vaults by collection — Aetheryn joins this list when its vault deploys.
const VAULTS = [
  "0xb78edcb4de39355747c62e6d55209c01a2294ad8", // Genesis Vault
];
const WETH = ADDRESSES.robinhood.WETH.toLowerCase()

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
  return api.getBalances()
}

module.exports = {
  methodology: "Value of stock tokens and holder-backed WETH held in STOCKMON vaults, excluding WETH claimable by the protocol treasury",
  robinhood: {
    tvl
  },
};
