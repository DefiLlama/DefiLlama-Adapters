const { staking } = require('../helper/staking');

const UNISWAP_V3_ETH_POOL = "0x03bc32cbaf0516945db77a32f2479379585aa17b";
const CITADAO_TOKEN = "0x3541A5C1b04AdABA0B83F161747815cd7B1516bC";


module.exports = {
  timetravel: true,
  methodology:
    "This is calculated as the amount of tokens staked in the liquidity pool on Uniswap v3",
  ethereum: {
    tvl: staking(UNISWAP_V3_ETH_POOL, CITADAO_TOKEN, "ethereum"),
  },
}
