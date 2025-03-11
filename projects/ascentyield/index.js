const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/solana");
const { post } = require('../helper/http');

const hyperliquidSubAccount = "0x75b2e5c67d2116bcf1b77c5e6444fc18bc5d38a4" // for trading at hyperliquid
const jlpholder = "9nAgg9wAnuiPv57dXkmCwoGhhbTHS1RRzvYLjnRGZtXp" // for keeping JLP and USDC(buy JLP)
const arbiusdcholder = "0xa6Ff9a77D6bD8B0a759055Cd8885e23228bc10Ec" // USDC on arbi(will bridge to solana)
const hyperliquidMainAccount = "0x7151609Fdc7E0Cac89FB9720F0957AF9d552f8f9" // will transfer USDC to sub account

module.exports = {
  misrepresentedTokens: true,
  doublecounted: true,
  methodology: "Aggregate trading account margins in HyperLiquid and JLP, USDC on the solana network.",
  arbitrum: {
    tvl
  },
};


async function tvl(api) {
  // hyperliquid tvl
  let data = await post('https://api.hyperliquid.xyz/info', { type: "clearinghouseState", user: hyperliquidSubAccount })
  data = parseInt(data.marginSummary.accountValue)
  api.addCGToken('usd-coin', data)

  // solana tvl
  await sumTokens2({ balances: api.getBalances(), owner: jlpholder })

  return api.sumTokens({ owners: [arbiusdcholder, hyperliquidMainAccount], tokens: [ADDRESSES.arbitrum.USDC_CIRCLE,] })
}