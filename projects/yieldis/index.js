const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { eulerTokens } = require('../helper/tokenMapping')

const config = {
  arbitrum: {
    ladle: '0x16E25cf364CeCC305590128335B8f327975d0560',
    fromBlock: 31012,
    oldPools: new Set([
      '0x7Fc2c417021d46a4790463030Fb01A948D54Fc04',
      '0xf76906AA78ECD4FcFB8a7923fB40fA42c07F20D6',
      '0x6651f8E1ff6863Eb366a319F9A94191346D0e323',
      '0x8C8A448FD8d3e44224d97146B25F4DeC425af309',
      '0xFCb9B8C5160Cf2999f9879D8230dCed469E72eeb',
      '0x13aB946C6A9645EDfF2A33880e0Fc37f67122170',
      '0x0FA29EEb169CDE6c779326d7b16c54529ECA1DD5',
    ].map(i => i.toLowerCase())),
  },
  ethereum: {
    ladle: '0x6cB18fF2A33e981D1e38A663Ca056c0a5265066A',
    fromBlock: 13461529,
    oldPools: new Set([
      '0x3771C99c087a81dF4633b50D8B149aFaA83E3c9E',
      '0x2e4B70D0F020E62885E82bf75bc123e1Aa8c79cA',
      '0x407353d527053F3a6140AAA7819B93Af03114227',
      '0x80142add3A597b1eD1DE392A56B2cef3d8302797',
      '0x5D14Ab14adB3a3D9769a67a1D09634634bdE4C9B',
      '0xEf82611C6120185D3BF6e020D1993B49471E7da0',
      '0x341B0976F962eC34eEaF31cdF2464Ab3B15B6301',
      '0xc3348D8449d13C364479B1F114bcf5B73DFc0dc6',
      '0x6BaC09a67Ed1e1f42c29563847F77c28ec3a04FC',
      '0xf5Fd5A9Db9CcCc6dc9f5EF1be3A859C39983577C',
      '0xA4d45197E3261721B8A8d901489Df5d4D2E79eD7',
      '0x4b32C37Be5949e77ba3726E863a030BD77942A97',
    ].map(i => i.toLowerCase())),
    blacklistedTokens: [
      '0x1344A36A1B56144C3Bc62E7757377D288fDE0369',
      ...eulerTokens
    ],
  },
}

module.exports = {
  hallmarks: [
    [Math.floor(new Date('2023-03-13') / 1e3), 'Euler was hacked'],
  ],
};

Object.keys(config).forEach(chain => {
  const { ladle, fromBlock, oldPools, blacklistedTokens, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        target: ladle, fromBlock, api,
        topic: 'PoolAdded(bytes6,address)',
        eventAbi: 'event PoolAdded(bytes6 indexed seriesId, address indexed pool)',
        onlyArgs: true,
        extraKey: 'PoolAdded',
      })
      const joinLogs = await getLogs({
        target: ladle, fromBlock, api,
        topic: 'JoinAdded(bytes6,address)',
        eventAbi: 'event JoinAdded(bytes6 indexed assetId, address indexed join)',
        onlyArgs: true,
        extraKey: 'JoinAdded',
      })
      const joins = joinLogs.map(i => i[1])
      const assets = await api.multiCall({ abi: 'address:asset', calls: joins })

      const pools = [...new Set(logs.map(i => i.pool))]
      const newPools = pools.filter(i => !oldPools.has(i.toLowerCase()))
      const tokens = await api.multiCall({ abi: 'address:base', calls: pools })
      const sharesTokens = await api.multiCall({ abi: 'address:sharesToken', calls: newPools })
      const tokensAndOwners = sharesTokens.map((v, i) => [v, newPools[i]])
      tokens.forEach((v, i) => tokensAndOwners.push([v, pools[i]]))
      assets.forEach((v, i) => tokensAndOwners.push([v, joins[i]]))
      return sumTokens2({ api, tokensAndOwners, blacklistedTokens })
    }
  }
})