const {onChainTvl} = require("../helper/balancer");

/**
 * All vaults are created by the same factory contract, deployed with same address,
 * but at different blocks on each chain.
 */
const config = {
  ethereum: { vault: '0xd315a9c38ec871068fec378e4ce78af528c76293', fromBlock: 17598578, },
  arbitrum: { vault: '0xd315a9c38ec871068fec378e4ce78af528c76293', fromBlock: 137451745, permitFailure: true },
  polygon: { vault: '0xd315a9c38ec871068fec378e4ce78af528c76293', fromBlock: 44520023,},
  optimism: { vault: '0xd315a9c38ec871068fec378e4ce78af528c76293', fromBlock: 120693792, },
  bsc: { vault: '0x03c01acae3d0173a93d819efdc832c7c4f153b06', fromBlock: 39148730,},
  base: { vault: '0x03c01acae3d0173a93d819efdc832c7c4f153b06', fromBlock: 14451361,},
  mode: { vault: '0xd315a9c38ec871068fec378e4ce78af528c76293', fromBlock: 7242549,},
  mantle: { vault: '0xd315a9c38ec871068fec378e4ce78af528c76293', fromBlock: 65689171,},
  scroll: { vault: '0xd315a9c38ec871068fec378e4ce78af528c76293', fromBlock: 6934854,},
  linea: { vault: '0xd315a9c38ec871068fec378e4ce78af528c76293', fromBlock: 6052579,},
}

/**
 * Standalone pools are pools that are not created by the factory contract.
 * We need only poolIds for computation,
 * but addresses and tokens are for more transparency
 */


Object.keys(config).forEach(chain => {
  const { vault, fromBlock, permitFailure } = config[chain]
  module.exports[chain] = {
    tvl: onChainTvl(vault, fromBlock, { permitFailure })
  }
})