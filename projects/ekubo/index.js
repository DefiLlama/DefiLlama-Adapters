const { sumTokens } = require('../helper/chain/starknet')
const { getConfig } = require('../helper/cache')
const { sumTokensExport } = require('../helper/unwrapLPs')

const market = '0x00000005dd3d2f4429af886cd1a3b08289dbcea99a294197e9eb43b0e0325b4b'

async function starknetTvl(api) {
  const tokens = await getConfig('ekubo-starknet-tokens', "https://prod-api.ekubo.org/tokens?chainId=23448594291968334")
  return sumTokens({ api, owner: market, tokens: tokens.map(t => t.address) })
}

const config = {
  ethereum: { 
    owners: ['0xe0e0e08a6a4b9dc7bd67bcb7aade5cf48157d444', '0x00000000000014aA86C5d3c41765bb24e11bd701'],
    blacklistedTokens: []
  }
}

Object.keys(config).forEach(chain => {
  config[chain].fetchCoValentTokens = true
  config[chain].tokenConfig = { onlyWhitelisted: false }
})

const ethTvl = sumTokensExport(config.ethereum)

module.exports = {
  methodology: 'Value of LP in the DEX, includes LPs that are out of range and thus not providing active liquidity',
  starknet: {
    tvl: starknetTvl
  },
  ethereum: {
    tvl: ethTvl
  },
  isHeavyProtocol: true,
}
