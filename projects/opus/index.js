const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require('../helper/chain/starknet')

const tokensAndOwners = [
  // Gates
  [ADDRESSES.starknet.ETH, "0x0315ce9c5d3e5772481181441369d8eea74303b9710a6c72e3fcbbdb83c0dab1"],
  [ADDRESSES.starknet.STRK, "0x031a96fe18fe3fdab28822c82c81471f1802800723c8f3e209f1d9da53bc637d"],
  [ADDRESSES.starknet.WBTC, "0x05bc1c8a78667fac3bf9617903dbf2c1bfe3937e1d37ada3d8b86bf70fb7926e"],
  [ADDRESSES.starknet.WSTETH, "0x02d1e95661e7726022071c06a95cdae092595954096c373cde24a34bb3984cbf"],
  [ADDRESSES.starknet.WSTETH_1, "0x03dc297a3788751d6d02acfea1b5dcc21a0eee1d34317a91aea2fbd49113ea58"],
  [ADDRESSES.starknet.XSTRK, "0x04a3e7dffd8e74a706be9abe6474e07fbbcf41e1be71387514c4977d54dbc428"],
  [ADDRESSES.starknet.SSTRK, "0x03b709f3ab9bc072a195b907fb2c27688723b6e4abb812a8941def819f929bd8"],
  [ADDRESSES.starknet.EKUBO, "0x06d44c6172f6b68fda893348d33be58b69f0add83ed480d1192d19bc4188c8f6"],
  // LORDS
  ["0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49", "0x020c0fbc1f2a724a94ebe3575e54c4111fa3eaaf3dac938cfcbd96cc83317bbf"],
  // Transmuters
  [ADDRESSES.starknet.USDC, "0x0560149706f72ce4560a170c5aa72d20d188c314ddca5763f9189adfc45e2557"],
  // Spiko US MMF
  ["0x20ff2f6021ada9edbceaf31b96f9f67b746662a6e6b2bc9d30c0d3e290a71f6", "0x0560149706f72ce4560a170c5aa72d20d188c314ddca5763f9189adfc45e2557"],
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
