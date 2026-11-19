const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// Genesis vaults: each Genesis NFT owns a basket of stock tokens.
const GENESIS_VAULT = "0xb78edcb4de39355747c62e6d55209c01a2294ad8" // original vault (WETH in, stock tokens bought)
const GENESIS_SIDECAR_VAULT = "0x1410d31db4a947736bbbe54ecbdd5cdc4a1cea4c" // DNA-era vault (native ETH in, same 16 stock tokens bought)

// DNA held for Aetheryn NFTs and sealed Eggs until the owner redeems, hatches or refunds.
const DNA = "0x5f2b0542caa2e6b8dab50bfa846063a723b5823b"
const DNA_HOLDERS = [
  "0xbe230be974523724c873232a73269025005f7738", // Aetheryn Birth Vault (Breeding v5)
  "0xb155dff749032dd5c1d37ae719207abac3bada9f", // Aetheryn Legacy DNA Vault (backs Breeding v3 and v4 Aetheryns after the MON to DNA migration)
  "0xfb61c5061721aa99563149599a64f0fcbcb5e6ec", // Aetheryn Tier Pool
  "0x6834f2132ba6fb15831e0dff9fd874d6a7fd7451", // Breeding v4 top-up vault
  "0x9d63df98db28fcb3dcc78d59e20aec04bc591706", // Breeding v5 coordinator (refundable Egg escrow)
]
const WETH = ADDRESSES.robinhood.WETH.toLowerCase()

async function tvl(api) {
  const assetRegistry = await api.call({ abi: 'address:assetRegistry', target: GENESIS_VAULT })
  const stocks = await api.fetchList({ lengthAbi: 'ASSET_COUNT', itemAbi: 'function assetAt(uint8) view returns (address)', target: assetRegistry })
  await api.sumTokens({ tokens: stocks.concat([WETH]), owners: [GENESIS_VAULT] })
  // The sidecar vault holds the same stock tokens plus native ETH waiting to be spent on them; all of it belongs to Genesis holders.
  await api.sumTokens({ tokens: stocks.concat([ADDRESSES.null]), owners: [GENESIS_SIDECAR_VAULT] })

  // Treasury revenue remains in the original vault until claimed, but it is not user TVL.
  const claimableTreasuryWeth = await api.call({ abi: 'uint256:claimableNonStockQuote', target: GENESIS_VAULT })
  api.add(WETH, (-BigInt(claimableTreasuryWeth)).toString())
  return api.getBalances()
}

module.exports = {
  methodology: "TVL is the value of stock tokens, holder-backed WETH and ETH held in the two STOCKMON Genesis vaults, excluding WETH claimable by the protocol treasury. Staking is the DNA (the protocol token, which replaced MON) held in the Aetheryn vaults and the Breeding Egg escrow, which backs each Aetheryn and each sealed Egg.",
  robinhood: {
    tvl,
    staking: sumTokensExport({ owners: DNA_HOLDERS, tokens: [DNA] }),
  },
};
