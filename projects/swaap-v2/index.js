const {onChainTvl} = require("../helper/balancer");

/**
 * All vaults are created by the same factory contract, deployed with same address,
 * but at different blocks on each chain.
 */
const config = {
  ethereum: { vault: '0xd315a9c38ec871068fec378e4ce78af528c76293', fromBlock: 17598578, },
  arbitrum: { vault: '0xd315a9c38ec871068fec378e4ce78af528c76293', fromBlock: 137451745,},
  polygon: { vault: '0xd315a9c38ec871068fec378e4ce78af528c76293', fromBlock: 44520023,},
}

/**
 * Standalone pools are pools that are not created by the factory contract.
 * We need only poolIds for computation,
 * but addresses and tokens are for more transparency
 */


Object.keys(config).forEach(chain => {
  const { vault, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: onChainTvl(vault, fromBlock)
  }
})