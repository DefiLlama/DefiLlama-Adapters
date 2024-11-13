const { isWhitelistedToken } = require('../helper/streamingHelper')
const { cachedGraphQuery } = require('../helper/cache')

async function getTokensConfig(api, isVesting) {
  const ownerTokens = []
  const { endpoints } = config[api.chain]
  let i = 0
  for (const endpoint of endpoints) {
    i++
    const { contracts, assets } = await cachedGraphQuery('sablier-v2/' + api.chain + '-' + i, endpoint, `{
      contracts { id address category }
      assets { id chainId symbol }
    }`)
    const owners = contracts.map(i => i.address)
    let tokens = assets.map(i => i.id)
    const symbols = assets.map(i => i.symbol)
    tokens = tokens.filter((v, i) => isWhitelistedToken(symbols[i], v, isVesting))
    owners.forEach(owner => ownerTokens.push([tokens, owner]))
  }

  return { ownerTokens }
}

async function tvl(api) {
  return api.sumTokens(await getTokensConfig(api, false))
}

async function vesting(api) {
  return api.sumTokens(await getTokensConfig(api, true))
}

const config = {
  ethereum: { endpoints: ['5EgaXheiBXZBCkepyGUYAu8pN31Dkbh7bpGtnLPqaT5m'], },
  arbitrum: { endpoints: ['8BnGPBojHycDxVo83LP468pUo4xDyCQbtTpHGZXR6SiB'], },
  bsc: { endpoints: ['BVyi15zcH5eUg5PPKfRDDesezMezh6cAkn8LPvh7MVAF'], },
  xdai: { endpoints: ['EXhNLbhCbsewJPx4jx5tutNXpxwdgng2kmX1J7w1bFyu'], },
  optimism: { endpoints: ['6e6Dvs1yDpsWDDREZRqxGi54SVdvTNzUdKpKJxniKVrp'], },
  polygon: { endpoints: ['CsDNYv9XPUMP8vufuwDVKQrVhsxhzzRHezjLFFKZZbrx'], },
  avax: { endpoints: ['FdVwZuMV43yCb1nPmjnLQwmzS58wvKuLMPzcZ4UWgWAc'], },
  base: { endpoints: ['3pxjsW9rbDjmZpoQWzc5CAo4vzcyYE9YQyTghntmnb1K'], },
  blast: { endpoints: ['BXoC2ToMZXnTmCjWftQRPh9zMyM7ysijMN54Nxzb2CEY'], },
  scroll: { endpoints: ['HVcngokCByfveLwguuafrBC34xB65Ne6tpGrXHmqDSrh'], },
  era: { endpoints: ['GY2fGozmfZiZ3xF2MfevohLR4YGnyxGxAyxzi9zmU5bY'], },
  mode: { endpoints: ['5ezGnVwNucVTW45WCb91VBiKBEdiqT4ceHDhh1KGigYG'], },
  linea: { endpoints: ['FoJnatzCZKyp9XjZyUBaw1juTb5ydnFvJvWUxS3oRCHZ'], },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl, vesting }
})
