const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require('../helper/chain/starknet')

const tokensAndOwners = [
  // Gates
  [ADDRESSES.starknet.ETH, "0x0315ce9c5d3e5772481181441369d8eea74303b9710a6c72e3fcbbdb83c0dab1"],
  [ADDRESSES.starknet.STRK, "0x031a96fe18fe3fdab28822c82c81471f1802800723c8f3e209f1d9da53bc637d"],
  [ADDRESSES.starknet.WBTC, "0x05bc1c8a78667fac3bf9617903dbf2c1bfe3937e1d37ada3d8b86bf70fb7926e"],
  [ADDRESSES.starknet.WSTETH, "0x02d1e95661e7726022071c06a95cdae092595954096c373cde24a34bb3984cbf"],
  // Transmuters
  [ADDRESSES.starknet.USDC, "0x03878595db449e1af7de4fb0c99ddb01cac5f23f9eb921254f4b0723a64a23cb"],
]

async function tvl(api) {
  return await sumTokens({ api, tokensAndOwners: tokensAndOwners });
}

module.exports = {
  methodology: 'Total value of collateral deposited by users into the smart contracts of Opus',
  starknet: {
    tvl,
  },
}
