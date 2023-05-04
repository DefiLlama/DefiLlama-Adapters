
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xB9665f6E5e3413B3a75Cc209556830E446fF9969";

module.exports = treasuryExports({
  arbitrum: {
    owners: [treasury, ],
    ownTokens: [
      "0x417a1aFD44250314BffB11ff68E989775e990ab6", // VOLTA
      "0xb1781BF9C582A71269c6098E4155Ea8b15B35305", // VOLT
    ],
    tokens: [
      nullAddress,
      "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT
      "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", // DAI
      "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC
      "0xd85E038593d7A098614721EaE955EC2022B9B91B", // gDAI
      "0xd92Be5A1c565Db5256cDD537B875ED46111Bd8b0", // VOLT2USD3CRV-f 
      "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH
      "0x39ff5098081FBE1ab241c31Fe0a9974FE9891d04", // voltGNS
    ],
  },
});