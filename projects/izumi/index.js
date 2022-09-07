const {  unwrapUniswapV3NFTs } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

const config = {
  ethereum: {
    pools: [
      '0x461b154b688D5171934D70F991C17d719082710C',
      '0x57AFF370686043B5d21fDd76aE4b513468B9fb3C',
      '0x8981c60ff02CDBbF2A6AC1a9F150814F9cF68f62',
      '0x99CC0A41F8006385f42aed747e2d3642a226d06E',
    ],
    pool2: [
      '0x9f58193b717449d00c7dcaf5d9F6f5AF48a09894',
      '0xbE138aD5D41FDc392AE0B61b09421987C1966CC3',
      '0xdc035e4b6fbc48103e213f9638a81defc9323b98',
    ],
  },
  polygon: {
    pools: [
      '0x01Cc44fc1246D17681B325926865cDB6242277A5',
      '0x150848c11040F6E52D4802bFFAfFBD57E6264737',
      '0x28d7BFf13c5A1227aEe2E892F8d22d8A1a84A0D4',
      '0xaFD5f7a790041761F33bFbf3dF1b54DF272F2576',
    ],
    pool2: [
      '0xC0840394978CbCDe9fCCcDE2934636853A524965',
    ],
  },
  arbitrum: {
    pools: [
      '0x1c0a560EF9f6Ff3f5c2BCCe98dC92f2649a507EF',
      '0xB2DeceA19D58ebe10ab215A04dB2EDBE52E37fA4',
      '0xbE138aD5D41FDc392AE0B61b09421987C1966CC3',
    ],
    pool2: [
      '0x0893eB041c20a34Ce524050711492Fa8377d838b',
    ],
  },
}

module.exports = {
  ownTokens: ['IZI', 'IUSD'],
}

Object.keys(config).forEach(chain => {
  const { pools, pool2 = []} = config[chain]
  module.exports[chain] = {
    tvl: getTvl(),
    pool2: getTvl(true),
  }

  function getTvl(isPool2) {
    const poolList = isPool2 ? pool2 : pools
    return async (_, _b, { [chain]: block }) => {
      return unwrapUniswapV3NFTs({ chain, block, owners: poolList, })
    }
  }
})

module.exports.ethereum.staking = staking('0xb56a454d8dac2ad4cb82337887717a2a427fcd00', '0x9ad37205d608b8b219e6a2573f922094cec5c200')
