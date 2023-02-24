const sdk = require('@defillama/sdk')

async function tvl(ts, block) {
  return {
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': (await sdk.api.erc20.totalSupply({ target: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', block })).output
  }
}

module.exports = {
  ethereum: { tvl },
  methodology: `TVL for WBTC consists of the BTC deposits in custody that were used to mint WBTC`
}
