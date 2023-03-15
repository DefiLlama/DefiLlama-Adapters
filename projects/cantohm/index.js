const { sumTokensExport } = require("../helper/unknownTokens");
const lps = [
  '0x2382994D8A15d2dd2aAE10561688Ef6cbe10CB8C',
  '0x5d3B693C00140E0cA2826C4AbC9E38b2E8CCd8f2',
  '0x1D20635535307208919f0b67c3B2065965A85aA9',
]

module.exports = {
  misrepresentedTokens: true,
  canto: {
    tvl: sumTokensExport({
      owner: '0xB8Ce90A08bdAdd3e6e6cD3173c0661FA94Aa81c5',
      tokens: [
        '0x4e71A2E537B7f9D9413D3991D37958c0b5e1e503',
        '0x826551890Dc65655a0Aceca109aB11AbDbD7a07B',
        ...lps,
      ],
      useDefaultCoreAssets: true,
    }),
    staking: sumTokensExport({
      owner: '0x6bb55835407Aa076B9028Cd8498788659346828e',
      tokens: [
        '0x533C0f08BE45eaaC821392B85E67Fb0c7DC2cab7',
      ],
      lps,
      useDefaultCoreAssets: true,
    }),
  }
}
