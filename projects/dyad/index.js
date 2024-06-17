const ADDRESSES = require("../helper/coreAssets.json");
const vaults = [
  "0xcF97cEc1907CcF9d4A0DC4F492A3448eFc744F6c",
  "0x7aE80418051b2897729Cbdf388b07C5158C557A1",
  "0x4fde0131694ae08c549118c595923ce0b42f8299",
  "0x7e5f2b8f089a4cd27f5b6b846306020800df45bd",
  // "0xf3768D6e78E65FC64b8F12ffc824452130BD5394", // Kerosene is own token
]

async function tvl(api) {
  const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
  tokens.push(ADDRESSES.null)
  vaults.push('0xdc400bbe0b8b79c07a962ea99a642f5819e3b712')
  return api.sumTokens({ tokensAndOwners2: [tokens, vaults] })
}

module.exports = {
  ethereum: {
    tvl,
  },
}