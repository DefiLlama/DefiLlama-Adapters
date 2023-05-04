const { sumTokens2 } = require('../helper/unwrapLPs')
const { covalentGetTokens } = require('../helper/http')
const vault = '0xd476ce848c61650e3051f7571f3ae437fe9a32e0'

async function tvl(_, _b, _cb, { api, }) {
  const tokens = await covalentGetTokens(vault, api.chain)
  return sumTokens2({
    api, owner: vault, tokens, blacklistedTokens: [
      '0x594f9274e08ba6c5760bacfba795b1879af17255'
    ]
  })
}

module.exports = {
  bsc: { tvl },
  polygon: { tvl },
  avax: { tvl },
  arbitrum: { tvl },
  optimism: { tvl },
  fantom: { tvl },
}
