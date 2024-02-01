const abi = require('./abi.json')
const { sumTokensExport } = require('../helper/unwrapLPs');
const { sliceIntoChunks } = require('../helper/utils');

// taken from https://app.fodl.finance/config.json
const config = {
  ethereum: {
    position_nft: '0x70febba7d45cfe6d99847ba4ccc393373b1ea8aa',
    lens_contract: '0x080155C42b0854C3A718B610cC5183e963851Afb',
    pool2: [
      ['0xa5c475167f03b1556c054e0da78192cd2779087f', '0xf958a023d5b1e28c32373547bdde001cad17e9b4'],
      ['0xce7e98d4da6ebda6af474ea618c6b175729cd366', '0xa7453338ccc29e4541e6c6b0546a99cc6b9eb09a'],
    ],
    staking: [
      ['0x4c2e59d098df7b6cbae0848d66de2f8a4889b9c3', '0x7e05540A61b531793742fde0514e6c136b5fbAfE'],
    ],
  },
  polygon: {
    position_nft: '0x7243c51c24b302b01094785f3c826f9311525613',
    lens_contract: '0xbfE6971Fc6F195bcacB72beE3427f5b4d8C3dc07',
    pool2: [
      ['0x2fc4dfcee8c331d54341f5668a6d9bcdd86f8e2f', '0xea7336c408ec8012e6b97368198512597e49c88a'],
    ],
  },
  bsc: {
    position_nft: '0x4c2e59d098df7b6cbae0848d66de2f8a4889b9c3',
    lens_contract: '0x6032035731c9F0b2E53Da63ca15444375E946559',
  },
}

module.exports = {
  methodology: "FODL leverages users positions on Aave and Compound. The fodl lens contract is used to get the positions metadata, especially supplyAmount and supplyTokenAddress, which counts as the TVL of the position of the user. Pool2 TVL are the tokens locked in the SUSHI pools",
};

Object.keys(config).forEach(chain => {
  const { position_nft, lens_contract, pool2, staking, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }, { api }) => {
      const allPositions = await api.fetchList({ lengthAbi: 'erc20:totalSupply', itemAbi: abi.tokenByIndex, target: position_nft, })
      for (const positions of sliceIntoChunks(allPositions, 50)) {
        const data = await api.multiCall({ abi: abi.getPositionsMetadata, calls: sliceIntoChunks(positions, 10).map(i => ({ params: [i] })), target: lens_contract, })
        data.forEach(j => {
          j.forEach(i => api.add(i.supplyTokenAddress, i.supplyAmount))
        })
      }
    }
  }

  if (pool2)
    module.exports[chain].pool2 = sumTokensExport({ tokensAndOwners: pool2, chain, })

  if (staking)
    module.exports[chain].staking = sumTokensExport({ tokensAndOwners: staking, chain, })
})
