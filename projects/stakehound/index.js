const sdk = require('@defillama/sdk');

const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

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
  ethereum: {
    tvl,
  },
  tvl
}