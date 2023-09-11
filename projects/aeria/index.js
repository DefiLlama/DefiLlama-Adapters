const { nullAddress } = require("../helper/tokenMapping");

const FACTORY = "0x649b80892ef773bd64cc3c663950dea3a604f660";

async function tvl(_, _1, _2, { api }) {
  let vaults = await api.fetchList({ lengthAbi: 'uint256:vaultCount', itemAbi: 'function vaults(uint256) view returns (address)', target: FACTORY, startFromOne: true, })
  vaults = vaults.filter(i => i !== nullAddress)
  console.log(vaults)
  const tokens = await api.multiCall({ abi: 'address:depositToken', calls: vaults })
  const bals = await api.multiCall({ abi: 'uint256:totalSupply', calls: vaults })
  api.addTokens(tokens, bals)
}

module.exports = {
  base: {
    tvl,
  },
}
