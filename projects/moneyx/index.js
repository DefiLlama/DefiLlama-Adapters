const { sumTokens2 } = require('../helper/unwrapLPs')

const VAULT = '0xeB0E5E1a8500317A1B8fDd195097D5509Ef861de'  // MoneyX main vault
const TOKENS = [
  '0x55d398326f99059fF775485246999027B3197955', // USDT
  '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // USDC
  '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
  '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', // BTCB
  '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', // ETH
  '0x570A5D26f7765Ecb712C0924E4De545B89fD43dF', // SOL
  '0xbA2aE424d960c26247Dd6c32edC70B295c744C43', // DOGE
  '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE', // XRP
]

async function tvl(api) {
  return sumTokens2({
    api,
    tokensAndOwners: TOKENS.map(t => [t, VAULT]),
  })
}

module.exports = {
  bsc: { tvl },
  methodology: 'TVL is calculated by summing the balance of stablecoins and major assets in the main MoneyX vault on BNB Chain.',
}
