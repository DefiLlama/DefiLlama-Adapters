const { nullAddress } = require("../helper/tokenMapping");

const FACTORY = "0x649b80892ef773bd64cc3c663950dea3a604f660";

async function tvl(_, _1, _2, { api }) {
  let vaults = await api.fetchList({ lengthAbi: 'uint256:vaultCount', itemAbi: 'function vaults(uint256) view returns (address)', target: FACTORY })
  vaults = vaults.filter(i => i !== nullAddress)
  const tokens = await api.multiCall({ abi: 'address:depositToken', calls: vaults })
  return api.sumTokens({ tokensAndOwners2: [tokens, vaults] })
}

module.exports = {
  base: {
    tvl,
  },
}
