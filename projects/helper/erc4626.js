
async function sumERC4626Vaults({ api, ...options }) {
  await api.erc4626Sum({ ...options })
  return api.getBalances()
}

function sumERC4626VaultsExport({ vaults, ...options}) {
  return async (api) => {
    return sumERC4626Vaults({ ...options, api, calls: vaults })
  }
}

module.exports = {
  sumERC4626Vaults,
  sumERC4626VaultsExport,
}