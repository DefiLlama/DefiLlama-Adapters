const { post } = require('../helper/http')

const VAULT = '0x1e37a337ed460039d1b15bd3bc489de789768d5e'

async function tvl(api) {
  const data = await post('https://api.hyperliquid.xyz/info', {
    type: 'clearinghouseState',
    user: VAULT,
  })
  api.addCGToken('usd-coin', parseFloat(data.marginSummary.accountValue))
}

module.exports = {
  timetravel: false,
  methodology: "TVL is the equity (accountValue) of the Growi HF Hyperliquid native vault, returned by the Hyperliquid info API's clearinghouseState. The vault holds USDC collateral and runs a quantitative perp strategy on HyperCore.",
  hyperliquid: { tvl },
}
