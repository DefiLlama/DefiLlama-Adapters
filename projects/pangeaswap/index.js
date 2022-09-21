const { getTridentTVL } = require('../helper/sushi-trident')
const BigNumber = require("bignumber.js");

/**
 * In Pangea Swap, there are multiple factories depending on the pool type.
 */

/// reference : https://github.com/pangea-protocol/pangea-core/blob/main/contracts/pool/ConcentratedLiquidityPool.sol
const normalPoolTVL = getTridentTVL({
  chain: 'klaytn',
  factory: '0x3d94b5e3b83cbd52b9616930d33515613adfad67'
});

/// reference : https://github.com/pangea-protocol/pangea-core/blob/main/contracts/custom/miningPool/MiningPool.sol
/// For mining liquidity
const miningPoolTVL = getTridentTVL({
  chain: 'klaytn',
  factory: '0x02d9bf2d4F5cEA981cB8a8B77A56B498C5da7Eb0'
})

/// reference : https://github.com/pangea-protocol/pangea-core/blob/main/contracts/custom/yieldPool/YieldPool.sol
/// For yield bearing token
const yieldPoolTVL = getTridentTVL({
  chain: 'klaytn',
  factory: '0x6C7Fc36c3F2792Faf12a5Ba8aa12379c5D01986d'
})

function aggregateTVL(...tvls) {
  const totalTVL = {}
  for (let tvl of tvls) {
    for (let token of Object.keys(tvl)) {
      if (! (token in totalTVL)) {
        totalTVL[token] = tvl[token];
      } else {
        totalTVL[token] = BigNumber(tvl[token]).plus(totalTVL[token]);
      }
    }
  }
  return totalTVL;
}

module.exports = {
  klaytn: {
    tvl: aggregateTVL(normalPoolTVL, miningPoolTVL, yieldPoolTVL),
  },
}
