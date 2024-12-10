const { get } = require('../helper/http')
const ADDRESSES = require("../helper/coreAssets.json");

async function tvl(api) {
  const vaults = await get('https://api.parraton.com/v1/vaults')
  const tvl =vaults.reduce((acc, vault) => {
    acc += Number(vault.tvlUsd)
    return acc
  }, 0)
  api.add(ADDRESSES.ton.USDT, tvl * 1e6)
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  methodology: `
The methodology for calculating TVL includes both the TON balance and LP token 
data for each vault. We convert the TON balance to its USD equivalent and add it 
to the value of DeDust LP tokens, which is calculated using on-chain data 
(reserve0, reserve1, total LP supply). The value of LP tokens is determined by 
their share of pool reserves, adjusted to USD. The total TVL is the sum of these 
values across all vaults. The calculation is performed on the Parraton API side.
  `.trim(),

  ton: {
    tvl
  }
}