const ADDRESSES = require("../helper/coreAssets.json");
const vaults = [
  "0x7aE80418051b2897729Cbdf388b07C5158C557A1",
  "0x4fde0131694ae08c549118c595923ce0b42f8299",
  "0x7e5f2b8f089a4cd27f5b6b846306020800df45bd",
  // "0xf3768D6e78E65FC64b8F12ffc824452130BD5394", // Kerosene is own token
  "0x3D72f7Fc3A9537e1fcC6FBF91AF55CcF2c5C4ed0",
  "0x3FC5c0e19b6287f25EB271c2E8e7Ba898FE7ab29",
  "0x5B74DD13D4136443A7831fB7AD139BA123B5071B",
  "0xB58d87dD30a67823acC4b9Fa533F464CdEdA737E",
]

async function tvl(api) {
  const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
  return api.sumTokens({ tokensAndOwners2: [tokens, vaults] })
}

module.exports = {
  ethereum: {
    tvl,
  },
}
