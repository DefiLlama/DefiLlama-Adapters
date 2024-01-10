
async function sumERC4626Vaults({ api, vaults, options = {} }) {
  await api.erc4626Sum({ calls: vaults, permitFailiure: true })
  return api.getBalances()
}

function sumERC4626VaultsExport({ vaults, ...options}) {
  return async (timestamp, ethBlock, chainBlocks, { api }) => {
    return sumERC4626Vaults({ ...options, api, vaults })
  }
}

module.exports = {
  sumERC4626Vaults,
  sumERC4626VaultsExport,
}