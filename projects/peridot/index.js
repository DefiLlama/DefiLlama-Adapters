const ADDRESSES = require('../helper/coreAssets.json')
const { compoundExports2 } = require('../helper/compound')
const { callSoroban } = require('../helper/chain/stellar')

// Peridot on Stellar is a Soroban deployment (not a Compound fork port). Since 2026-11-12 it runs
// supply-only cash markets: each market contract custodies its underlying SAC directly, with
// borrowing disabled and no yield source attached. The previous ReceiptVault markets
// (CBU4Y7CJ..., CBVUJJIJ..., CD3WN3PL...) were retired after a key compromise and hold nothing.
const stellarMarkets = [
  { market: 'CDW3GDNKLUEPPJLEUVGLJSKGYLB3YYDQBUY7NBHJILGQWNN55AYFHY3F', underlying: ADDRESSES.stellar.USDC },
  { market: 'CBHMG4CNJO2CRGADUMIO3UJ45C5MTWGCBFECMR6QE2TDDCDBB3N24WMS', underlying: ADDRESSES.stellar.XLM },
  { market: 'CD6OTGA6J6UIEKXTXA5CLPLSJA4VQ5HEOYP3CA375CZEHI3KMIL2OYZC', underlying: 'CCCRWH6Q3FNP3I2I57BDLM5AFAT7O6OF6GKQOC6SSJNDAVRZ57SPHGU2' }, // PYUSD
  { market: 'CAXWP5M2SF74DW22EQAYOXR4ZHN2FO2HGL737KQ2WFPEZTA4Z3W5E2M4', underlying: ADDRESSES.stellar.EURC },
]

// Unborrowed underlying held by each market, i.e. the Soroban equivalent of Compound's getCash().
async function stellarTvl(api) {
  await Promise.all(stellarMarkets.map(async ({ market, underlying }) => {
    const cash = await callSoroban(market, 'get_available_liquidity')
    api.add(underlying, cash.toString())
  }))
}

async function stellarBorrowed(api) {
  await Promise.all(stellarMarkets.map(async ({ market, underlying }) => {
    const borrowed = await callSoroban(market, 'get_total_borrowed')
    api.add(underlying, borrowed.toString())
  }))
}

module.exports = {
  methodology: 'TVL is the underlying held by the protocol and not lent out: on BSC, Monad and Robinhood Chain the underlying balance of every Peridot market listed on the comptroller, on Stellar the available liquidity of each cash market (USDC, XLM, PYUSD, EURC). Outstanding debt is reported separately as borrowed.',
  bsc: compoundExports2({ comptroller: '0x6fC0c15531CB5901ac72aB3CFCd9dF6E99552e14' }),
  monad: compoundExports2({ comptroller: '0x6D208789f0a978aF789A3C8Ba515749598940716', blacklistedMarkets: ['0xf8255935e62aa000c89de46a97d2f00bfff147e7'], cether: '0x2FB2861402A22244464435773dd1C6951735CdF7' }),
  // USDG / NVDA lending markets behind the isolated-margin product; margin collateral is pUSDG, so it is in the market cash.
  robinhood: compoundExports2({ comptroller: '0x6148183676e304dbe63a85c350c208da3ceac39c' }),
  stellar: { tvl: stellarTvl, borrowed: stellarBorrowed },
}
