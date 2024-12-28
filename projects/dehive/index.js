const { sumTokensExport } = require("../helper/unwrapLPs");

const config = {
  ethereum: {
    clusters: ['0x6Bc3F65Fc50E49060e21eD6996be96ee4B404752'],
    pool2s: [['0x60c5bf43140d6341bebfe13293567fafbe01d65b', '0x4964B3B599B82C3FdDC56e3A9Ffd77d48c6AF0f0']],
    stakings: [['0x62Dc4817588d53a056cBbD18231d91ffCcd34b2A', '0x04595f9010F79422a9b411ef963e4dd1F7107704']],
  },
  polygon: {
    stakings: [['0x5fCB9de282Af6122ce3518CDe28B7089c9F97b26', '0x88cFC1bc9aEb80f6C8f5d310d6C3761c2a646Df7']],
    pool2s: [['0xfd0E242c95b271844bf6860D4bC0E3e136bC0f7C', '0xf4feb23531EdBe471a4493D432f8BB29Bf0A3868']],
    impulses: ['0xE6E6982fb5dDF4fcc74cCCe4e4eea774E002D17F', '0xf4feb23531EdBe471a4493D432f8BB29Bf0A3868'],
    clusters: ['0x4964B3B599B82C3FdDC56e3A9Ffd77d48c6AF0f0', '0x589Ea336092184d9eD74b8263c4eecA73Ed0cE7a'],
  },
  bsc: {
    stakings: [['0x58759dd469ae5631c42cf8a473992335575b58d7', '0x35f28aA0B2F34eFF17d2830135312ab2a777De36']],
    pool2s: [['0x72ba008B631D9FD5a8E8013023CB3c05E19A7CA9', '0xF2e8CD1c40C766FEe73f56607fDffa526Ba8fa6c']],
    impulses: ['0xA9c97Ff825dB9dd53056d65aE704031B4959d99a'],
    clusters: ['0x0a684421ef48b431803BFd75F38675EAb1e38Ed5'],
  },
  xdai: {
    stakings: [['0xFbdd194376de19a88118e84E279b977f165d01b8', '0x589Ea336092184d9eD74b8263c4eecA73Ed0cE7a']],
    pool2s: [['0x14EE6d20B8167eacb885F4F2F45C3Bf2d4FD06f4', '0xa4E7BE054000603B82B79208aC3eE5428554CaF6']],
    impulses: ['0xfa7Ca14a28CD419a69E45e8416cA4FA87457aCE8'],
    clusters: ['0xF557B2B73b872E6d2F43826f9D77B7402A363Bc0', '0xA6C090c5572f54d529B0839b8fd2D50a4afB1E6B'],
  },
}

Object.keys(config).forEach(chain => {
  const { clusters, pool2s, stakings, impulses } = config[chain]

  const blacklistedTokens = []
  if (pool2s) pool2s.forEach(p => blacklistedTokens.push(p[0]))
  if (stakings) stakings.forEach(s => blacklistedTokens.push(s[0]))

  const blacklistedSet = new Set(blacklistedTokens.map(i => i.toLowerCase()))

  const exportObj = {
    tvl: async (api) => {
      if (clusters) {
        const tokens = await api.multiCall({ abi: 'address[]:getUnderlyings', calls: clusters })
        const ownerTokens = tokens.map((t, i) => [t, clusters[i]])
        await api.sumTokens({ ownerTokens })
      }

      if (impulses) {
        for (const impulse of impulses) {
          let i = 0
          let length = 5
          let moreTokens = true
          do {
            const calls = []
            for (let j = 0; j < length; j++) {
              calls.push(i + j)
              i += length
            }
            const data = await api.multiCall({ abi: 'function poolInfo(uint256) view returns (address token, uint256 lastReward, uint256 poolSupply, bool paused, address strategy)', calls, target: impulse, permitFailure: true })
            moreTokens = data.some(d => !d)
            data.forEach(i => {
              if (!i) return;
              if (blacklistedSet.has(i.token.toLowerCase())) return;
              api.add(i.token, i.poolSupply)
            })
          } while (moreTokens)
        }
      }
    }
  }

  if (pool2s)
    exportObj.pool2 = sumTokensExport({ tokensAndOwners: pool2s, resolveLP: true, })

  if (stakings)
    exportObj.staking = sumTokensExport({ tokensAndOwners: stakings, })
  module.exports[chain] = exportObj
})
