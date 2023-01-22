const { getUniTVL } = require('../helper/unknownTokens');
const sdk = require('@defillama/sdk')
const factories = [
  '0x64203f29f4d6a7e199b6f6afbe65f1fa914c7c4e', // v2
  '0xC9567a8B6b622cdc8076C6b4432Ade0e11F50Da1', // v3
]

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://becoswap.com/info as the source. Staking accounts for the BECO locked in MasterChef (0x20e8Ff1e1d9BC429489dA76B1Fc20A9BFbF3ee7e)',
  kardia: {
    tvl: sdk.util.sumChainTvls(factories.map(factory => getUniTVL({
      chain: 'kardia',
      useDefaultCoreAssets: true,
      factory,
    })))
  },
};
