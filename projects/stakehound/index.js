const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');

const wethAddress = ADDRESSES.ethereum.WETH

async function tvl(timestamp, block) {
  const supply = await sdk.api.erc20.totalSupply({
    target: '0xDFe66B14D37C77F4E9b180cEb433d1b164f0281D',
    block
  })

  return {
    [wethAddress]: supply.output
  }
}

module.exports = {
  methodology: 'Counts staked ETH tokens',
  ethereum: {
    tvl,
  },
}
