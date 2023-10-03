const { nullAddress } = require("../helper/tokenMapping");
const ADDRESSES = require('../helper/coreAssets.json')

const FACTORY = "0x649b80892ef773bd64cc3c663950dea3a604f660";

async function tvl(timestamp, _1, _2, { api }) {
  let vaults = await api.fetchList({ lengthAbi: 'uint256:vaultCount', itemAbi: 'function vaults(uint256) view returns (address)', target: FACTORY, startFromOne: true, })
  vaults = vaults.filter(i => i !== nullAddress)
  
  const tokens = await api.multiCall({ abi: 'address:depositToken', calls: vaults })

  await api.sumTokens({ owner: '0xe7C5e2D6E99f91Ec161B128702011D6E8f91570F', tokens: [ADDRESSES.base.USDC]})
  return api.sumTokens({ tokensAndOwners2: [tokens, vaults]})
  // const bals = await api.multiCall({ abi: 'uint256:totalSupply', calls: vaults })
  // api.addTokens(tokens, bals)
}

module.exports = {
  base: {
    tvl,
  },
}
