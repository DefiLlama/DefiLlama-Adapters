const { sumUnknownTokens } = require('./helper/unknownTokens');

module.exports.hallmarks=[
  [1618966800, "Venus incident"],
  [1634778000, "Emissions end"],
]

const config = {
  aurora: "0x62537419c8327AB66165bAE205Da8fcB6871A700",
  avax: "0x864A0B7F8466247A0e44558D29cDC37D4623F213",
  boba: "0x864A0B7F8466247A0e44558D29cDC37D4623F213",
  bsc: "0x0895196562c7868c5be92459fae7f877ed450452",
  celo: "0xdD11b66B90402F294a017c4688509c364312303F",
  cronos: "0x76b8c3ECdF99483335239e66F34191f11534cbAA",
  fantom: "0x76b8c3ECdF99483335239e66F34191f11534cbAA",
  fuse: "0x9C30e4B50b4b3804D3b50f01619c61fE44ed894e",
  harmony: "0x9c57658139afb41949cebc07d806f37d29d13eea",
  heco: "0x96a29c4bce3126266983f535b41c30dba80d5d99",
  moonbeam: "0x77286f5257e090b1bedbc6df6726d53cbf8573a6",
  moonriver: "0xfadA8Cc923514F1D7B0586aD554b4a0CeAD4680E",
  oasis: "0xbf19C3fe078258F1D1C34bEc7e624AD8a1DE343A",
  okexchain: "0x864A0B7F8466247A0e44558D29cDC37D4623F213",
  polygon: "0x89d065572136814230A55DdEeDDEC9DF34EB0B76",
  velas: "0xAd2DB12795CeD89cA2D1819710233106115E3034",
  xdai: "0xfadA8Cc923514F1D7B0586aD554b4a0CeAD4680E",
  evmos: "0x9C30e4B50b4b3804D3b50f01619c61fE44ed894e",
  kcc: "0x76b8c3ECdF99483335239e66F34191f11534cbAA",
  wan: "0xAd2DB12795CeD89cA2D1819710233106115E3034",
}

Object.keys(config).forEach(chain => {
  const masterchef = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const data = await api.fetchList({  lengthAbi: 'uint256:poolLength', itemAbi: 'function poolInfo(uint256) view returns (address want, uint256,uint256,uint256,address strat)', target: masterchef, })
      const tokens = data.map(i => i.want)
      const bals = await api.multiCall({  abi: 'uint256:wantLockedTotal', calls: data.map(i => i.strat), permitFailure: true, })
      bals.forEach((v, i) => v && api.add(tokens[i], v))
      return sumUnknownTokens({ api, resolveLP: true, useDefaultCoreAssets: true, })
    }
  }
})
