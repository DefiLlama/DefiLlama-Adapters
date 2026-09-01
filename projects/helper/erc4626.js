const { sumTokens2 } = require("./unwrapLPs")

async function sumERC4626Vaults({ api, ...options }) {
  await api.erc4626Sum({ ...options })
  return api.getBalances()
}

function sumERC4626VaultsExport({ vaults, ...options }) {
  return async (api) => {
    await sumERC4626Vaults({ ...options, api, calls: vaults })
    return sumTokens2({ api }) // hack to transform tokens
  }
}

function sumERC4626VaultsExport2({ vaults, ...options }) {
  return async (api) => {
    await sumERC4626Vaults({ isOG4626: true, ...options, api, calls: vaults })
    return sumTokens2({ api }) // hack to transform tokens
  }
}

module.exports = {
  sumERC4626Vaults,
  sumERC4626VaultsExport,
  sumERC4626VaultsExport2,
}