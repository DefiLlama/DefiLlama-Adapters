const { getTridentTVLFromFactories } = require('../helper/sushi-trident')

/**
 * In Pangea Swap, there are multiple factories depending on the pool type.
 */

module.exports = {
  klaytn: {
    tvl: getTridentTVLFromFactories({
      chain: 'klaytn',
      factories: [
        /// reference : https://github.com/pangea-protocol/pangea-core/blob/main/contracts/pool/ConcentratedLiquidityPool.sol
        '0x3d94b5e3b83cbd52b9616930d33515613adfad67',
        /// reference : https://github.com/pangea-protocol/pangea-core/blob/main/contracts/custom/miningPool/MiningPool.sol
        '0x02d9bf2d4F5cEA981cB8a8B77A56B498C5da7Eb0',
        /// reference : https://github.com/pangea-protocol/pangea-core/blob/main/contracts/custom/yieldPool/YieldPool.sol
        '0x6C7Fc36c3F2792Faf12a5Ba8aa12379c5D01986d'
      ]
    }),
  },
}
