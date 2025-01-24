const { getConfig } = require("../helper/cache");

const isEvm = (address) => /^0x[a-fA-F0-9]{40}$/.test(address)

const tvl = async (api) => {
  const vaults = Object.keys(await getConfig('nucleus-vaults', "https://backend.nucleusearn.io/v1/protocol/markets"))
  const tokens = (await getConfig('nucleus-tokens', "https://backend.nucleusearn.io/v1/protocol/tokens")).filter(isEvm)
  return api.sumTokens({ owners: vaults, tokens })
}

module.exports = {
  ethereum: { tvl }
}