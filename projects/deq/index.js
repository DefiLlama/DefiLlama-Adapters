const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

const stAvailContract = ADDRESSES.ethereum.STAVAIL;

async function eth(timestamp, ethBlock, chainBlocks) {
  const pooledAvail = await sdk.api.abi.call({
    block: ethBlock,
    target: stAvailContract,
    abi: "uint256:assets"
  })

  return {
    [ADDRESSES.ethereum.AVAIL]: pooledAvail.output
  }
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: eth
  },
}
