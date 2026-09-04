const { getConfig } = require('../helper/cache')
const { getTokenSupplies } = require('../helper/solana')

// Every Exponent market wraps a yield-bearing position in an SY (standardized yield) mint. The SY
// mints are priced by the coins service: Generic SY mints redirect to the yield-bearing token they
// wrap one for one, the rest are valued as base asset x the vault's SY exchange rate. TVL is therefore
// just the supply of each SY mint.
async function tvl(api) {
  const { data: mints } = await getConfig('exponent', 'https://web-api.exponent.finance/api/lyt-growth/standard-yield-tokens')
  await getTokenSupplies(mints.map(({ mintSy }) => mintSy), { api })
}

module.exports = {
  timetravel: false,
  methodology: "TVL is the total supply of each Exponent SY (standardized yield) mint, valued at the price of the yield-bearing token it wraps.",
  solana: { tvl },
}
