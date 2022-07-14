const sdk = require("@defillama/sdk")
const abi = require("./abi.json")
const { sumTokens, } = require('../helper/unwrapLPs')
const { getChainTransform } = require("../helper/portedTokens")

const CONFIG = {
  ethereum: {
    router: '0x8731d54E9D02c286767d56ac03e8037C07e01e98',
    etherToken: '0x0000000000000000000000000000000000000000',
  },
  bsc: {
    router: '0x4a364f8c717cAAD9A442737Eb7b8A55cc6cf18D8',
  },
  polygon: {
    router: '0x45A01E4e04F14f7A4a6702c74187c5F6222033cd',
  },
  arbitrum: {
    router: '0x53Bf833A5d6c4ddA888F69c22C88C9f356a41614',
    etherToken: '0x0000000000000000000000000000000000000000',
  },
  optimism: {
    router: '0xB0D502E938ed5f4df2E681fE6E419ff29631d62b',
    etherToken: '0x0000000000000000000000000000000000000000',
  },
  fantom: {
    router: '0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6',
  },
  avalanche: {
    router: '0x45A01E4e04F14f7A4a6702c74187c5F6222033cd',
  },
}

/*** Ethereum TVL Portions ***/
const tvl = (chain) => async (timestamp, _block, chainBlocks) => {
  const {
    [chain]: { router, etherToken, }
  } = CONFIG

  if (chain === 'avalanche') chain = 'avax'

  const balances = {}
  const block = chainBlocks[chain]
  const tokens = []
  const transformAddress = await getChainTransform(chain)

  const factory = (await sdk.api.abi.call({ abi: abi.factory, target: router, block, chain, })).output
  const allPoolsLength = (await sdk.api.abi.call({ abi: abi.allPoolsLength, target: factory, block, chain, })).output

  for (let i = 0; i < allPoolsLength; i++) {
    let pool = (await sdk.api.abi.call({ abi: abi.allPools, target: factory, block, params: i, chain, })).output
    let token = (await sdk.api.abi.call({ abi: abi.token, target: pool, block, chain, })).output
    const { output: symbol } = await sdk.api.erc20.symbol(token, chain)
    if (symbol === 'SGETH') {
      if (!etherToken)  throw new Error('Missing Ether token')
      pool = token
      token = etherToken
    }
    tokens.push([token, pool])
  }

  await sumTokens(balances, tokens, block, chain, transformAddress)
  return balances
}

const chainExports = Object.keys(CONFIG).reduce((agg, chain) => ({ ...agg, [chain]: { tvl: tvl(chain) } }), {})

module.exports = {
  misrepresentedTokens: true,
  ...chainExports
}
