const { sumTokens2 } = require("../helper/unwrapLPs")

module.exports = {
  methodology: `TVL is supply balance minus borrows the euler contract.`,
}

const config = {
  ethereum: { factory: '0x29a56a1b8214D9Cf7c5561811750D5cBDb45CC8e', }
}

Object.keys(config).forEach(chain => {
  const { factory, } = config[chain]

  async function getVaults(api) {
    const vaults = await api.fetchList({ lengthAbi: 'getProxyListLength', itemAbi: 'proxyList', target: factory })
    const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
    return { vaults, tokens }
  }

  module.exports[chain] = {
    tvl: async (api) => {
      const { vaults, tokens } = await getVaults(api)
      return sumTokens2({ api, tokensAndOwners2: [tokens, vaults], permitFailure: true })
    },
    borrowed: async (api) => {
      const { vaults, tokens } = await getVaults(api)
      const borrows = await api.multiCall({ abi: 'uint256:totalBorrows', calls: vaults })
      api.add(tokens, borrows)
    },
  }
})
