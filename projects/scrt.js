const utils = require('./helper/utils.js');

const urls = ['https://api-bridge-mainnet.azurewebsites.net/tokens/?page=0&size=1000', 'https://bridge-bsc-mainnet.azurewebsites.net/tokens/?page=0&size=1000']

const tvl = async (api) => {
  for (const url of urls) {
    const { data } = await utils.fetchURL(url)
      data.tokens.forEach(({ src_coin, totalLockedUSD }) => {
        if (src_coin !== "UNILP-WSCRT-ETH" && src_coin !== "WSCRT") {
          api.addUSDValue(Math.round(totalLockedUSD))
        }
    })
  }
}

module.exports = {
  misrepresentedTokens: true,
  secret: { tvl }
}