const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

async function tvl(ts, block, _) {
  return {
    [ADDRESSES.ethereum.tBTC]: (await sdk.api.erc20.totalSupply({ target: ADDRESSES.ethereum.tBTC, block })).output
  }
}

module.exports = {
  ethereum: { tvl },
  methodology: `TVL for tBTC consists of the BTC deposits in custody that were used to mint tBTC`
}
