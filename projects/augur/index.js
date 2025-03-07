const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');

const dai = ADDRESSES.ethereum.DAI
const universe = '0x49244bd018ca9fd1f06ecc07b9e9de773246e5aa'
const delegator = '0xd5524179cB7AE012f5B642C1D6D700Bbaa76B96b'

async function tvl(timestamp, block) {
  const daiBalance = await sdk.api.erc20.balanceOf({
    target: dai,
    owner: universe,
    block
  })
  const ethBalance = await sdk.api.eth.getBalance({
    target: delegator,
    block
  })

  return {
    [ADDRESSES.null]: ethBalance.output,
    [dai]: daiBalance.output
  }
}

module.exports = {
  ethereum: {
    tvl,
  },
  hallmarks:[
    [1613091600, "Election market resolves"]
  ]
}
