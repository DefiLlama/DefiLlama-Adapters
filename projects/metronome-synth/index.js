const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs")

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owner: '0x3691ef68ba22a854c36bc92f6b5f30473ef5fb0a',
      tokens: [
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.WETH,
        "0xd1C117319B3595fbc39b471AB1fd485629eb05F2",
        ADDRESSES.ethereum.FRAX,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.WBTC,
        "0xa8b607Aa09B6A2E306F93e74c282Fb13f6A80452",
        "0xc14900dFB1Aa54e7674e1eCf9ce02b3b35157ba5",
        ADDRESSES.ethereum.sfrxETH,
        "0x4Dbe3f01aBe271D3E65432c74851625a8c30Aa7B",
        "0x650CD45DEdb19c33160Acc522aD1a82D9701036a",
        "0xDD9F61a85fFE73E41eF889817972f0B0AaE6D6Dd"
      ]
    }),
  },
  optimism: {
    tvl: sumTokensExport({
      owner: '0x4c6bf87b7fc1c8db85877151c6ede38ed27c34f6',
      tokens: [
        ADDRESSES.optimism.USDC,
        ADDRESSES.optimism.WETH_1,
        ADDRESSES.optimism.OP,
        "0xdd63ae655b388cd782681b7821be37fdb6d0e78d",
        "0xccf3d1acf799bae67f6e354d685295557cf64761",
        "0x19382707d5a47e74f60053b652ab34b6e30febad",
        "0x539505dde2b9771debe0898a84441c5e7fdf6bc0",
      ]
    }),
  },
  base: {
    tvl: sumTokensExport({
      owner: '0xAeDF96597338FE03E8c07a1077A296df5422320e',
      tokens: [
        ADDRESSES.base.USDC,
        ADDRESSES.base.WETH,
        "0x1e41238aCd3A9fF90b0DCB9ea96Cf45F104e09Ef",
        "0x82562507429876486B60AF4F32390ef0947b3d13",
        "0x46fb68Eb2b1Fc43654AbaE5691D39D18D933E4b4",
      ]
    }),
  }
}
