const sdk = require("@defillama/sdk")
const token = '0x889138644274a7dc602f25a7e7d53ff40e6d0091'
const chain = 'conflux'

function xcfxSupply(target) {
  return async (timestamp, block, chainBlocks) => {
      let supply = {};
      supply = { everscale: (await sdk.api.abi.call({
        target,
          abi: 'erc20:totalSupply',
          block: chainBlocks[chain],
          chain
      })).output / 10 ** 17 };
      console.log(supply);
      return supply ;
  };
}

module.exports = {
  methodology: 'TVL accounts for XCFX Supply. Staking gets the amount of CFX-XCFX LPs Staked. Pool2 refers to the CFX-NUT LPs staked in the Masterchef Contract',
  conflux: {
    tvl: xcfxSupply(token, "conflux", () => "wrapped-conflux"),
  },
}