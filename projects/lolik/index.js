const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

const bahamutContract = ADDRESSES.bahamut.stFTN;

async function ftn(timestamp, bahamutBlock, chainBlocks) {
  const pooledFTN = await sdk.api.abi.call({
    block: bahamutBlock,
    target: bahamutContract,
    abi: "uint256:getTotalPooledFtn"
  })

  return {
    [ADDRESSES.null]: pooledFTN.output,
  }
}

module.exports = {
  hallmarks: [
  ],
  methodology: 'Staked tokens are counted as TVL based on the chain that they are staked on and where the liquidity tokens are issued',
  timetravel: false,
  doublecounted: true,
  bahamut: {
    tvl: ftn
  },
}
