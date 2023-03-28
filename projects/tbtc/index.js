const sdk = require('@defillama/sdk')

async function tvl(ts, block) {
  return {
    '0x18084fba666a33d37592fa2633fd49a74dd93a88': (await sdk.api.erc20.totalSupply({ target: '0x18084fba666a33d37592fa2633fd49a74dd93a88', block })).output
  }
}

module.exports = {
  ethereum: { tvl },
  methodology: `TVL for tBTC consists of the BTC deposits in custody that were used to mint tBTC`
}
