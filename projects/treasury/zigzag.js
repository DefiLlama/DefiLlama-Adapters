const { nullAddress, treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
    ],
    owners: ['0xF203f949C1c4cA53B960C1ba33cB6455Bb9b0079'],
    ownTokens: ['0xc91a71a1ffa3d8b22ba615ba1b9c01b2bbbf55ad'],
  },
})
