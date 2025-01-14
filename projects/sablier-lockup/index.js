const { isWhitelistedToken } = require('../helper/streamingHelper')
const { cachedGraphQuery } = require('../helper/cache')

const config = {
  arbitrum: { endpoints: ['8BnGPBojHycDxVo83LP468pUo4xDyCQbtTpHGZXR6SiB'], },
  base: { endpoints: ['3pxjsW9rbDjmZpoQWzc5CAo4vzcyYE9YQyTghntmnb1K'], },
  blast: { endpoints: ['BXoC2ToMZXnTmCjWftQRPh9zMyM7ysijMN54Nxzb2CEY'], },
  avax: { endpoints: ['FdVwZuMV43yCb1nPmjnLQwmzS58wvKuLMPzcZ4UWgWAc'], },
  era: { endpoints: ['GY2fGozmfZiZ3xF2MfevohLR4YGnyxGxAyxzi9zmU5bY'], },
  bsc: { endpoints: ['BVyi15zcH5eUg5PPKfRDDesezMezh6cAkn8LPvh7MVAF'], },
  ethereum: { endpoints: ['5EgaXheiBXZBCkepyGUYAu8pN31Dkbh7bpGtnLPqaT5m'], },
  linea: { endpoints: ['FoJnatzCZKyp9XjZyUBaw1juTb5ydnFvJvWUxS3oRCHZ'], },
  mode: { endpoints: ['5ezGnVwNucVTW45WCb91VBiKBEdiqT4ceHDhh1KGigYG'], },
  optimism: { endpoints: ['6e6Dvs1yDpsWDDREZRqxGi54SVdvTNzUdKpKJxniKVrp'], },
  polygon: { endpoints: ['CsDNYv9XPUMP8vufuwDVKQrVhsxhzzRHezjLFFKZZbrx'], },
  scroll: { endpoints: ['HVcngokCByfveLwguuafrBC34xB65Ne6tpGrXHmqDSrh'], },
  xdai: { endpoints: ['EXhNLbhCbsewJPx4jx5tutNXpxwdgng2kmX1J7w1bFyu'], },
	chz: { endpoints: ['HKvzAuGjrEiza11W48waJy5csbhKpkMLF688arwHhT5f'], },
}


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
    // Filter vesting tokens
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

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl, vesting }
})
