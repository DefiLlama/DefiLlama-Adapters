const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');

async function xdaiTvl(timestamp, ethBlock, { xdai: block }) {
  const chain = "xdai"
  const supply = await sdk.api.erc20.totalSupply({
    target: '0xF490c80aAE5f2616d3e3BDa2483E30C4CB21d1A0',
    block,
    chain
  })

  return {
    [ADDRESSES.ethereum.GNO]: supply.output
  }
}

module.exports = {
  methodology: 'Counts coins staked',
  xdai:{
    tvl: xdaiTvl
  }
}
