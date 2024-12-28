const {transformDexBalances} = require('../helper/portedTokens')
const {sumTokensExport} = require('../helper/unknownTokens')
const ADDRESSES = require('../helper/coreAssets.json')

const PAIRFACTORY = '0x061FFE84B0F9E1669A6bf24548E5390DBf1e03b2';
const VOTINGESCROW = '0x28A8e21CFE4586002B4829EBdd7f6F3d88Ed79c1';
const STRAT_TOKEN = '0x5a093a9c4f440c6b105F0AF7f7C4f1fBE45567f9';
const LP_STRAT_USDC = '0xA474ee9dbdd528b9C79ea3C790Dd6E5821d9307D';

const config = {
  mantle: PAIRFACTORY
}
module.exports = {
  misrepresentedTokens: true,
}

Object.keys(config).forEach(chain => {
  const factory = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const pairs = await api.fetchList({lengthAbi: 'allPairsLength', itemAbi: 'allPairs', target: factory})
      const isPool3 = await api.multiCall({
        abi: 'function is3pool(address) view returns (bool)',
        calls: pairs,
        target: factory
      })
      const pool3 = pairs.filter((_, i) => isPool3[i])
      const pool2 = pairs.filter((_, i) => !isPool3[i])

      // handle uni like pairs
      const isStables = await api.multiCall({abi: 'bool:stable', calls: pool2,})
      const token0s = await api.multiCall({abi: 'address:token0', calls: pool2})
      const token1s = await api.multiCall({abi: 'address:token1', calls: pool2})
      const token0Bals = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: token0s.map((t, i) => ({target: t, params: pool2[i]}))
      })
      const token1Bals = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: token1s.map((t, i) => ({target: t, params: pool2[i]}))
      })

      const dexData = []
      for (let i = 0; i < pool2.length; i++) {
        if (isStables[i]) {
          api.add(token0s[i], token0Bals[i])
          api.add(token1s[i], token1Bals[i])
        } else {
          dexData.push({
            token0: token0s[i],
            token1: token1s[i],
            token0Bal: token0Bals[i],
            token1Bal: token1Bals[i],
          })
        }
      }

      // handle 3pool like pairs
      const token3s = await api.multiCall({abi: "address[]:getTokensArray", calls: pool3})
      await api.sumTokens({ownerTokens: token3s.map((v, i) => [v, pool3[i]])})

      return transformDexBalances({api, data: dexData,})
    },

    staking: sumTokensExport({
      owner: VOTINGESCROW,
      tokens: [STRAT_TOKEN],
      lps: [LP_STRAT_USDC],
      coreAssets: [ADDRESSES.mantle.USDC],
      restrictTokenRatio: 100,
    }),

    hallmarks: [
      [1707400800, "TGE"],
      [1707955200, "Epoch 1"]
    ]

  }
})