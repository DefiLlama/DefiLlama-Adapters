const ADDRESSES = require('../helper/coreAssets.json')

/*
 * 0xEquity — tokenized real-estate (RWA) protocol on Base.
 *
 * TVL has two components:
 *   1. Property NAV — the on-chain USD value of every tokenized property that the
 *      Marketplace factory has deployed: sum(totalSupply * PropertyOracle price).
 *      Property tokens have 0 decimals (1 token = 1 fractional share) and the
 *      oracle price is a USD value scaled by 1e18 (WAD).
 *   2. USDC custodied by the protocol across the on-chain-liquidity router, the
 *      marketplace, the rent-distribution contracts, and the USDC buyback vaults.
 */

const USDC = ADDRESSES.base.USDC // 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

// Marketplace = property-token factory; exposes getDeployedProperties()
const MARKETPLACE = '0xf5c7A456841C1f0DB4d0a2c958FEfa47d680B4ff'
// PropertyOracle / PriceRegistry — per-property USD price feed (getPrice(address))
const ORACLE = '0xc09D5fa11428854186777136d4D41c1C21Ca3377'

// Contracts that custody USDC on behalf of the protocol
const USDC_CUSTODIANS = [
  '0xAe18881a3c7FaBe66A22A7D4e626bA7018AD2a3C', // OCL Router (on-chain-liquidity)
  MARKETPLACE, //                                  Marketplace (buy/sell escrow + fees)
  '0x18A22BF3A303A6C2536c166A9692253b7305095E', // RentShare (rent staking)
  '0x70210628C7de52dB04045f70ab1Cb4598A5DCc55', // RentDistributor (rent redemption)
  '0x1a3ca329eEDDFAF6A3e3992D78A20e5646eBb750', // USDC Buyback Vault (ERC-4626)
]

async function tvl(api) {
  // 1) USDC held across marketplace, rent distribution, and buyback vaults
  await api.sumTokens({ owners: USDC_CUSTODIANS, tokens: [USDC] })

  // 2) Tokenized property NAV = sum(totalSupply * oraclePrice) over all properties
  const properties = await api.call({
    target: MARKETPLACE,
    abi: 'address[]:getDeployedProperties',
  })
  const supplies = await api.multiCall({
    abi: 'erc20:totalSupply',
    calls: properties,
  })
  const prices = await api.multiCall({
    abi: 'function getPrice(address) view returns (uint256)',
    calls: properties.map((p) => ({ target: ORACLE, params: [p] })),
  })

  let nav = 0
  properties.forEach((_, i) => {
    // property tokens: 0 decimals; oracle price: USD scaled by 1e18
    nav += (Number(supplies[i]) * Number(prices[i])) / 1e18
  })
  if (nav > 0) api.addUSDValue(nav)
}

module.exports = {
  methodology:
    'TVL is the on-chain USD NAV of all tokenized real-estate property tokens deployed by the 0xEquity Marketplace (each property token totalSupply x its PropertyOracle price), plus USDC custodied by the protocol across the OCL Router, Marketplace, RentShare, RentDistributor, and the USDC Buyback Vault.',
  start: 1733745369, // 2024-12-09, first Base deploy (marketplace block 23478011)
  base: { tvl },
}
