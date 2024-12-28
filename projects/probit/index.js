const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
        "0x72e5263ff33d2494692d7f94a758aa9f82062f73",
        "0xaD285fDEDFC0D5f944A33e478356524293c7eC68",
        "0xf71afe21cd32959113fc47ae2ef886b43a9413d5"
    ],
  },
  bsc: {
    owners: [
        "0xd6a4452eebde830888cee4a395126831ab16250c",
        "0xf4be044ba7461d8444ed53f9ec7490781e08e3b7",
        "0x898fce2414a1347c0e12bde6b28b75843fd9bbad"
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.probit,
  },
  fantom: {
    owners: [
        "0xc78600a92caf0fcf6990e7ea7381bf4297054f86",
        "0x06ffd89a07b078d4a1a1d9947a28e95825f9c35c",
        "0x813e711993fc8ec29e9e45fb3a7e47f8c33ca64f"
    ],
  },
  polygon: {
    owners: [
        "0xfaef9cc9bf46c386c58a3e86ffffbf77969ca149",
        "0x29b6e9abf51fc7d4581f6cbd1a9d5392fa7fa78f",
        "0xdba24f19bce0f32ea4273faea7c01d7f9d4f91d6"
    ],
  },
  tron: {
    owners: [
        "TPkn5zpxXr8jaNqvgVoFanTsvXCbNXJ8GB",
        "TGEwJxVErWagXnriZATPMBFFbbeuad9m3h",
        "TYiFSQG4dfdWh8RWETsvJn4fvXdZ8bEL7t"
    ],
  },
  ripple: {
    owners: [
        "rwXEHNNuf3nctzXLtvL5JnQJGMyUZYGrVc",
        "rsA9ijHjo7hAkitc9GsXsiwXzqGs7eoeqr",
        "rEa9cAYavjfxvmdJExr1PMGxoPYzAUZXGb"
    ],
  },
  solana: {
    owners: [
        "BX145kKanqBmeud72ir44iMFVAfaak4y933rgbMc2H52",
        "FavWP1KXVVNZLTYjfSBWPanxbVeCW4A3pJ96hn2GRWGR",
    ],
  },
}

module.exports = cexExports(config)
