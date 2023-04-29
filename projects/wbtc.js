const ADDRESSES = require('./helper/coreAssets.json')
const sdk = require('@defillama/sdk')

async function tvl(ts, block) {
  return {
    [ADDRESSES.ethereum.WBTC]: (await sdk.api.erc20.totalSupply({ target: ADDRESSES.ethereum.WBTC, block })).output
  }
}

module.exports = {
  ethereum: { tvl },
  methodology: `TVL for WBTC consists of the BTC deposits in custody that were used to mint WBTC`
}
