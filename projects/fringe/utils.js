
function getExports(config, exportsObj) {

  Object.keys(config).forEach(chain => {
    const pit = config[chain]
    exportsObj[chain] = {
      tvl: async (api) => {
        const { lendingTokens, projectTokens, bTokens } = await getConfig(api)
        const ownerTokens = bTokens.map((v, i) => [[lendingTokens[i]], v])
        ownerTokens.push([lendingTokens, pit])
        ownerTokens.push([projectTokens, pit])
        return api.sumTokens({ ownerTokens })
      },
      borrowed: async (api) => {
        const { lendingTokens, bTokens } = await getConfig(api)
        const bals = await api.multiCall({ abi: 'uint256:totalBorrows', calls: bTokens })
        api.addTokens(lendingTokens, bals)
        return api.getBalances()
      },
    }

    async function getConfig(api) {
      const lendingTokens = await api.fetchList({ lengthAbi: 'lendingTokensLength', itemAbi: 'lendingTokens', target: pit })
      const projectTokens = await api.fetchList({ lengthAbi: 'projectTokensLength', itemAbi: 'projectTokens', target: pit })
      const bTokens = (await api.multiCall({ target: pit, calls: lendingTokens, abi: 'function lendingTokenInfo(address) view returns (bool isListed, bool isPaused, address bLendingToken)' })).map(i => i.bLendingToken)
      return { lendingTokens, projectTokens, bTokens }
    }
  })
}

module.exports = {
  getExports
}