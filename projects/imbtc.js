
const sdk = require('@defillama/sdk')

async function tvl(ts, block) {
  return {
    'bitcoin': (await sdk.api.erc20.totalSupply({ target: '0x3212b29E33587A00FB1C83346f5dBFA69A458923', block })).output / 1e8
  }
}

module.exports = {
  ethereum: { tvl },
  methodology: `TVL for WBTC consists of the BTC deposits in custody that were used to mint WBTC`
}
