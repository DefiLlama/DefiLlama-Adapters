const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')

const chains = ['ethereum', 'arbitrum', 'merlin', 'btr', 'bsc', 'base', 'bsquared', 'core', 'bevm', 'mantle', 'scroll', 'bob', 'ailayer', 'iotex', 'rsk', 'zeta', 'hemi', 'goat', 'plume_mainnet', 'hsk']

const excludeVaults = {
  bob: [
    '0xf05a5AfC180DBB10A3E1dd29235A6151e6088cC8',
  ],
  core: [
    '0x25B737513fD2588f2b0Ffc8Dee06d2B999f7E595',
  ],
  zeta: [
    '0xC1Aa0accd30D394a0fFa1de4bCde4a8D70F6981C',
  ],
  btr: [
    '0x88C08C6bBCf02955cA7c15054286134c4Bfa67a2',
  ],
  plume_mainnet: [
    '0x92D374dd17F8416c8129f5Efa81f28E0926a60B7',
    '0x2DFc08F4FAd29761adf4cD9F1918296dC6F305C4',
  ],
  goat: [
    '0x6f0AfADE16BFD2E7f5515634f2D0E3cd03C845Ef',
    '0xCf464Ecc9a295eDd53C1C3832fC41c2Bc394A474',
  ],
  rsk: [
    '0xf05a5AfC180DBB10A3E1dd29235A6151e6088cC8',
  ],
}

chains.forEach(chain => {
  module.exports[chain] = {
    tvl: async function (api) {
      if (api.chain === 'bevm') api.chainId = 11501
      if (api.chain === 'hemi') api.chainId = 43111
      if (api.chain === 'goat') api.chainId = 2345
      if (api.chain === 'plume_mainnet') api.chainId = 98866
      if (api.chain === 'hsk') api.chainId = 177
      if (!api.chainId) throw new Error('chainId is required, missing in ' + api.chain)
      const blacklists = excludeVaults[api.chain] || []
      const { result } = await getConfig(`pell/${api.chain}-v1`, `https://api.pell.network/v1/stakeList?chainId=${api.chainId}`)
      const vaults = result.map(f => f.strategyAddress).filter(v => !blacklists.includes(v))
      const tokens = await api.multiCall({ abi: 'address:underlyingToken', calls: vaults })
      return sumTokens2({ api, tokensAndOwners2: [tokens, vaults], })
    }
  }
})
