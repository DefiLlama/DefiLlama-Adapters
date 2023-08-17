const ADDRESSES = require('./helper/coreAssets.json')
const sdk = require('@defillama/sdk')

async function tvl(ts, block) {
  return {
    [ADDRESSES.ethereum.WBTC]: (await sdk.api.erc20.totalSupply({ target: ADDRESSES.ethereum.WBTC, block })).output
  }
}
async function tvlTron(ts, block, _, { api }) {
  return {
    [ADDRESSES.ethereum.WBTC]: (await api.call({ target: 'TXpw8XeWYeTUd4quDskoUqeQPowRh4jY65', abi: 'erc20:totalSupply' })),
    ['ethereum:'+ADDRESSES.null]: (await api.call({ target: 'TXWkP3jLBqRGojUih1ShzNyDaN5Csnebok', abi: 'erc20:totalSupply' })),
  }
}

module.exports = {
  ethereum: { tvl },
  tron: { tvl: tvlTron },
  methodology: `TVL for WBTC consists of the BTC deposits in custody that were used to mint WBTC`
}
