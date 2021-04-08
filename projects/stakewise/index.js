const sdk = require('@defillama/sdk');

const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

async function tvl(timestamp, block) {
  const supply = await sdk.api.erc20.totalSupply({
    target: '0xFe2e637202056d30016725477c5da089Ab0A043A',
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