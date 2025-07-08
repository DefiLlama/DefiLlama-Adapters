const { sumTokens2 } = require("../helper/unwrapLPs")

const orderbooks = {
  arbitrum: {
    v3: [
      { address: "0x90caf23ea7e507bb722647b0674e50d8d6468234", start: 1710573200 },
    ],
    v4: [
      { address: "0x550878091b2b1506069f61ae59e3a5484bca9166", start: 1727110056 },
    ]
  },
  base: {
    v3: [
      { address: "0x2aee87d75cd000583daec7a28db103b1c0c18b76", start: 1710593051 },
    ],
    v4: [
      { address: "0xd2938e7c9fe3597f78832ce780feb61945c377d7", start: 1724856007 }, 
      { address: "0xa2f56f8f74b7d04d61f281be6576b6155581dcba", start: 1719934425 },
      { address: "0x32aCbdF51abe567C91b7a5cd5E52024a5Ca56844", start: 1724451937 },
      { address: "0x80DE00e3cA96AE0569426A1bb1Ae22CD4181dE6F", start: 1724168357 },
      { address: "0x7A44459893F99b9d9a92d488eb5d16E4090f0545", start: 1723404441 },
    ],
  },
  bsc: {
    v3: [
      { address: "0xb1d6d10561d4e1792a7c6b336b0529e4bfb5ea8f", start: 1710592564 },
    ],
    v4: [
      { address: "0xd2938e7c9fe3597f78832ce780feb61945c377d7", start: 1727110200 },
    ]
  },
  ethereum: {
    v3: [
      { address: "0xf1224a483ad7f1e9aa46a8ce41229f32d7549a74", start: 1707183011 },
    ],
    v4: [
      { address: "0x0eA6d458488d1cf51695e1D6e4744e6FB715d37C", start: 1729850783 },
    ]
  },
  flare: {
    v3: [
      { address: "0xb06202aA3Fe7d85171fB7aA5f17011d17E63f382", start: 1712406628 },
    ],
    v4: [
      { address: "0xcee8cd002f151a536394e564b84076c41bbbcd4d", start: 1725430973 },
      { address: "0xaa3b14Af0e29E3854E4148f43321C4410db002bC", start: 1724097373 },
      { address: "0xA2Ac77b982A9c0999472c1De378A81d7363d926F", start: 1724079109 },
      { address: "0x582d9e838FE6cD9F8147C66A8f56A3FBE513a6A2", start: 1720717267 },
    ]
  },
  linea: {
    v3: [],
    v4: [
      { address: "0x22410e2a46261a1b1e3899a072f303022801c764", start: 1727718941 },
      { address: "0xF97DE1c2d864d90851aDBcbEe0A38260440B8D90", start: 1722282647 },
    ]
  },
  // matchain: {
  //   v3: [],
  //   v4: [
  //     { address: "0x40312EDAB8Fe65091354172ad79e9459f21094E2", start: 1725285390 },
  //   ]
  // },
  polygon: {
    v3: [
      { address: "0xde5abe2837bc042397d80e37fb7b2c850a8d5a6c", start: 1705929922 },
      { address: "0x34200e026fbac0c902a0ff18e77a49265ca6ac99", start: 1691086795 },
      { address: "0xd3edafeb9eaa454ce26e60a66ccda73939c343a4", start: 1698953082 },
      { address: "0xc95a5f8efe14d7a20bd2e5bafec4e71f8ce0b9a6", start: 1710528345 },
      { address: "0x95c9bf235435b660aa69f519904c3f175aab393d", start: 1698859456 },
      { address: "0xdcdee0e7a58bba7e305db3abc42f4887ce8ef729", start: 1701659318 },
      { address: "0x16d518706d666c549da7bd31110623b09ef23abb", start: 1702067640 },
    ],
    v4: [
      { address: "0x7d2f700b1f6fd75734824ea4578960747bdf269a", start: 1726792922 },
      { address: "0x2f209e5b67a33b8fe96e28f24628df6da301c8eb", start: 1721758591 },
      { address: "0xb8CD71e3b4339c8B718D982358cB32Ed272e4174", start: 1723733415 },
      { address: "0x001B302095D66b777C04cd4d64b86CCe16de55A1", start: 1723728017 },
      { address: "0xAfD94467d2eC43D9aD39f835BA758b61b2f41A0E", start: 1721746069 },
    ]
  },
}

async function tvl(api) {
  const { v3 = [], v4 = [] } = orderbooks[api.chain]
  const owners = v3.concat(v4).map(orderbook => orderbook.address)
  return sumTokens2({ api, owners, fetchCoValentTokens: true, permitFailure: true })
}

module.exports = {
  methodology: 'Balance of tokens held by Rain Orderbook contract.',
}

Object.keys(orderbooks).forEach(chain => {
  module.exports[chain] = { tvl }
})
