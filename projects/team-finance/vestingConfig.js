const v3 = '0x64d06dcc12fa07e302f052a9f5bc1aa11e29d9e2'
const v4 = '0xd1ebaa101867b3df136640c843d69a4646613fed'

module.exports = {
  ethereum: {
    fromBlock: 15368035, v2FromBlock: 15297897, factories: [v3, v4],
    blacklistedTokens: [
      '0x3c41c80b966b92d345dc8fc91e5508bc7248da6e', // CST
      '0x44a8701fb5c8c22b90d839363e6c2b2c1a58a525', // ANOA
      '0x83f4389ccce1cc044dd7441add33c4f28b967434', // DRX
      '0x58412ae274f2764b71c66315d97662d47d930d94', // NEX
      '0x0f719591e2bcb6fcc3e68b16d2a88c89c6ae0d42', // EVOLVE
      '0x1337b164d318234ccafc3b06c726f522314b2799', // BIG
    ],
  },
  bsc: {
    fromBlock: 19909467, v2FromBlock: 20244767, factories: ['0xd5d3d09997e005a05477a52b2eaf98d9276655a7', v3, v4],
    blacklistedTokens: [
      '0xb583961e033dfe0fff161952f7ba21c411b6103d', // YOU
      '0xdf5c227ab75d309d46fb9df0f7fa043e4534d2ab', // GBCK
      '0xad600060a153bc35bd8997cefe959efb19026757', // GAG
      '0xf117dfcb241c0003d5e2fc72f288755c17a46980', // SIXP
    ],
  },
  base: { fromBlock: 2951440, factories: [v3, v4], },
  arbitrum: { fromBlock: 124267770, factories: [v3, v4], },
  polygon: { fromBlock: 30715517, v2FromBlock: 31637453, factories: [v3, v4], },
  avax: { fromBlock: 18393367, v2FromBlock: 18350097, factories: [v3, v4], },
  fantom: { fromBlock: 69441842, v2FromBlock: 46365810, factories: [v3, v4], },
  mantle: { fromBlock: 18080827, factories: [v3, v4], },
  pulse: { fromBlock: 15141503, factories: [v3, '0xf44c89b6846c8a9bc068899513fbf27ac1c23a96'], },
  kava: { fromBlock: 1982214, v2FromBlock: 1912675, factories: ['0xd5d3d09997e005a05477a52b2eaf98d9276655a7', v4], },
  flare: {
    fromBlock: 32116891, factories: ['0x6dd27f2b82f78dd8a802a9228f340518280359f1'],
    blacklistedTokens: [
      '0x657097cc15fdec9e383db8628b57ea4a763f2ba0', // SPRK
    ],
  },
  klaytn: { fromBlock: 170539718, factories: ['0x6dd27f2b82f78dd8a802a9228f340518280359f1'], },
  era: { fromBlock: 13265113, factories: ['0xb5ded5774bb01b22a06e58a06917ef1f10b2f61a', '0x2d45b63e04b1fb612e3df1ccd66b81ee10c6a5d5'], },
  lukso: { fromBlock: 4796196, factories: [v4], },
  berachain: { fromBlock: 4083978, factories: [v4], },
  unichain: { fromBlock: 17091208, factories: [v4], },
  monad: { fromBlock: 100676245, factories: ['0x00c6b2512eefea1f56c60f7e504437ad698162de'], },
  robinhood: { fromBlock: 21499903, factories: ['0x49ca925aed111385b09675524ffc047873d3baab'], },
  arc: { fromBlock: 21000052, factories: ['0xdee913d8d3de17a9810fddfe9951caf5d6c55faa'], },
}
