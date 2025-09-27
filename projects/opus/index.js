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
  // tBTC
  ["0x04daa17763b286d1e59b97c283c0b8c949994c361e426a28f743c67bdfe9a32f", "0x07b0b47cb98d8282b6c86d267cb575c81a50f603cd07bb8c1e692e77eacc4c26"],
  // SolvBTC
  ["0x0593e034dda23eea82d2ba9a30960ed42cf4a01502cc2351dc9b9881f9931a68", "0x01f556ed83aa7b204301d1aeb290f9755b79fdb5b7d7a56854c81d3dd736c695"],
  // LBTC
  ["0x036834a40984312f7f7de8d31e3f6305b325389eaeea5b1c0664b2fb936461a4", "0x0764d5947a816bd2f5b0a3262405508a40c4afd026aa50a1e24c8cb234630ac0"],
  // enzoBTC
  ["0x057a66754ba6c64c1705a007e8b5e7d17a88593234fb854a1e111f2bfce65450", "0x02b5029fe0f403f19d336128ba28c08c44d79782cd2514da624d77c3503b456f"],
  // pumpBTC
  ["0x061c68717c10da8adf6bd5cda6840510d6e70c62fcf96d25a57bfcf2932beca6", "0x052dcb7becae5735192e7cc811db8230609579140cf47e4e6ed7a5fea362ba4e"],
  // uniBTC
  ["0x023a312ece4a275e38c9fc169e3be7b5613a0cb55fe1bece4422b09a88434573", "0x01583087431138e16a49c70cb64d05d876f46b06178b200ff6c57e1da571719c"],
  // xWBTC
  ["0x06a567e68c805323525fe1649adb80b03cddf92c23d2629a6779f54192dffc13", "0x02ad9fef1109565064334bf16632158c73ca6ae0bd8eedfaae652544e73e47e4"],
  // xtBTC
  ["0x043a35c1425a0125ef8c171f1a75c6f31ef8648edcc8324b55ce1917db3f9b91", "0x0073348c89345735938f1ebc5b237f034bb63874e895311c5db0b29a15e9908a"],
  // xLBTC
  ["0x07dd3c80de9fcc5545f0cb83678826819c79619ed7992cc06ff81fc67cd2efe0", "0x0616551ebe73c1ea97ad2d7c7c9575039cc456fea5c8529701a39cc9c0ad4805"],
  // xsBTC
  ["0x0580f3dc564a7b82f21d40d404b3842d490ae7205e6ac07b1b7af2b4a5183dc9", "0x06a5bac0cdaa7126e32dd478c86f84906f4a7ff597cbaa9b0d537312887f5a19"],
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
