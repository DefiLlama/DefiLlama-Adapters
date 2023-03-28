const { sumTokensExport } = require("../helper/unknownTokens");
const lps = [
  '0xF65af1E61D7aC87d73E347D17E369Dc2118E9517',
]

module.exports = {
  misrepresentedTokens: true,
  canto: {
    tvl: sumTokensExport({
      owner: '0x20636bd0E15be0e1faADE1b27f568e642f59814E',
      tokens: [
        '0x4e71A2E537B7f9D9413D3991D37958c0b5e1e503',
        '0x826551890Dc65655a0Aceca109aB11AbDbD7a07B',
        '0x5FD55A1B9FC24967C4dB09C513C3BA0DFa7FF687',
        '0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd',
        ...lps,
      ],
      useDefaultCoreAssets: true,
    }),
    staking: sumTokensExport({
      owner: '0xbE718E9431c4E25F4Af710f085a475074e24D7Cd',
      tokens: [
        '0xfC65316f26949B268f82519256C159B23ACC938F',
      ],
      lps,
      useDefaultCoreAssets: true,
    }),
  }
}
